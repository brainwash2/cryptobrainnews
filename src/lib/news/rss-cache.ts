/**
 * lib/news/rss-cache.ts
 * Redis-backed RSS feed cache with:
 *   - 1-hour TTL per feed (per spec)
 *   - Distributed lock to prevent cache stampede on cold starts
 *   - Stale-while-revalidate: serves last-known-good data if live fetch fails
 *   - Per-feed independent caching (one bad feed never blocks others)
 *
 * Stampede guard:
 *   When a feed's cache expires, the first worker acquires a short-lived
 *   lock key (SET NX PX 15s). All other concurrent workers see the lock and
 *   serve the stale value while the winner re-fetches.
 */

import 'server-only';
import { Redis } from '@upstash/redis';
import type { RSSFeed, RSSItem } from './types';
import { isRSSItem } from './types';

const CACHE_TTL_SECONDS = 60 * 60;
const LOCK_TTL_MS = 15_000;
const STALE_TTL_SECONDS = 60 * 60 * 24;
const KEY_PREFIX_FEED = 'rss:feed:';
const KEY_PREFIX_STALE = 'rss:stale:';
const KEY_PREFIX_LOCK = 'rss:lock:';
const RSS_FEED_TIMEOUT_MS = parseInt(process.env.RSS_FEED_TIMEOUT_MS ?? '8000', 10);

interface CachedFeed {
  feed: RSSFeed;
  cachedAt: string;
}

function feedKey(url: string): string { return KEY_PREFIX_FEED + Buffer.from(url).toString('base64url'); }
function staleKey(url: string): string { return KEY_PREFIX_STALE + Buffer.from(url).toString('base64url'); }
function lockKey(url: string): string { return KEY_PREFIX_LOCK + Buffer.from(url).toString('base64url'); }

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Minimal RSS XML→RSSItem parser (shared with daily-article.ts). */
function parseRSSXML(xml: string, sourceUrl: string, sourceName: string): RSSFeed {
  const items: RSSItem[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const [, body] of itemMatches) {
    const get = (tag: string): string =>
      (body.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`))?.[1] ??
        body.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`))?.[1] ??
        '').trim();

    const raw: unknown = {
      title: get('title'),
      link: get('link'),
      pubDate: get('pubDate') || new Date().toISOString(),
      guid: get('guid') || get('link'),
      description: get('description'),
      content: get('content:encoded') || undefined,
      author: get('author') || get('dc:creator') || undefined,
      categories: body.match(/<category[^>]*>([^<]+)<\/category>/g)
        ?.map((c) => c.replace(/<[^>]+>/g, '').trim()) ?? [],
      imageUrl: body.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ??
        body.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] ?? undefined,
    };

    if (isRSSItem(raw)) items.push(raw);
  }

  return { source: sourceName, url: sourceUrl, items, fetchedAt: new Date().toISOString() };
}

export class RSSCache {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  /**
   * Fetch a single feed, using cached data when available.
   * Never throws – returns stale cached feed on timeout/failure or empty feed.
   */
  async getFeed(url: string, sourceName: string): Promise<RSSFeed> {
    const cached = await this.redis.get<CachedFeed>(feedKey(url));
    if (cached) return cached.feed;

    const acquired = await this.redis.set(lockKey(url), '1', {
      nx: true,
      px: LOCK_TTL_MS,
    });

    if (!acquired) {
      const stale = await this.redis.get<CachedFeed>(staleKey(url));
      if (stale) return stale.feed;
      return { source: sourceName, url, items: [], fetchedAt: new Date().toISOString() };
    }

    let fetchStartedAt = Date.now();
    let releaseLockEarly = false;

    try {
      const fetchPromise = this.fetchLive(url, sourceName);
      const slowWarn = sleep(Math.floor(RSS_FEED_TIMEOUT_MS * 0.8)).then(() => {
        if (Date.now() - fetchStartedAt >= Math.floor(RSS_FEED_TIMEOUT_MS * 0.8)) {
          console.warn('[rss-cache] feed slow', { url, sourceName, timeoutMs: RSS_FEED_TIMEOUT_MS });
        }
      });

      const feed = await Promise.race([fetchPromise, slowWarn.then(() => fetchPromise)]);
      const durationMs = Date.now() - fetchStartedAt;
      releaseLockEarly = durationMs < 5000;

      const payload: CachedFeed = { feed, cachedAt: new Date().toISOString() };
      const pipeline = this.redis.pipeline();
      pipeline.set(feedKey(url), payload, { ex: CACHE_TTL_SECONDS });
      pipeline.set(staleKey(url), payload, { ex: STALE_TTL_SECONDS });
      await pipeline.exec();

      return feed;
    } catch {
      const stale = await this.redis.get<CachedFeed>(staleKey(url));
      return stale?.feed ?? { source: sourceName, url, items: [], fetchedAt: new Date().toISOString() };
    } finally {
      if (releaseLockEarly) {
        await this.redis.del(lockKey(url));
      } else {
        await this.redis.del(lockKey(url));
      }
    }
  }

  /**
   * Fetch all feeds concurrently. Per-feed errors are isolated.
   * Returns a flat, deduplicated (by guid) list of RSSItems.
   */
  async getAllItems(
    feeds: Array<{ url: string; name: string }>,
  ): Promise<{ items: RSSItem[]; feedResults: RSSFeed[] }> {
    const settled = await Promise.allSettled(
      feeds.map(({ url, name }) => this.getFeed(url, name)),
    );

    const feedResults = settled
      .filter((result): result is PromiseFulfilledResult<RSSFeed> => result.status === 'fulfilled')
      .map(result => result.value);

    const seen = new Set<string>();
    const items: RSSItem[] = [];
    for (const feed of feedResults) {
      for (const item of feed.items) {
        if (!seen.has(item.guid)) {
          seen.add(item.guid);
          items.push(item);
        }
      }
    }

    return { items, feedResults };
  }

  /** Force-invalidate a feed's primary cache (not stale). Useful for webhooks. */
  async invalidate(url: string): Promise<void> {
    await this.redis.del(feedKey(url));
  }

  private async fetchLive(url: string, sourceName: string): Promise<RSSFeed> {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(RSS_FEED_TIMEOUT_MS),
      headers: { 'User-Agent': 'CryptoBrainNews/1.0 (+https://cryptobrainnews.com)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    const xml = await res.text();
    return parseRSSXML(xml, url, sourceName);
  }
}
