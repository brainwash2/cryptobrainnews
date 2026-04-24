/**
 * lib/news/dedup.ts
 * Redis-backed deduplication for the RSS ingestion and daily-article pipeline.
 *
 * Strategy:
 *  - Primary key:   SHA-256 of normalised article URL (stable, content-independent)
 *  - Secondary key: SHA-256 of normalised headline (catches re-published URLs)
 *  - TTL:           7 days (604 800 s) – long enough to prevent re-processing
 *    within any reasonable publishing cycle, short enough to allow genuine re-runs.
 *
 * Usage:
 *   const dedup = new ArticleDedup();
 *   if (await dedup.isDuplicate(item.link, item.title)) continue;
 *   // … process …
 *   await dedup.markSeen(item.link, item.title, pipelineRunId);
 */

import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

const DEDUP_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const KEY_PREFIX_URL = 'dedup:url:';
const KEY_PREFIX_TITLE = 'dedup:title:';

export interface DedupRecord {
  seenAt: string;         // ISO-8601
  pipelineRunId: string;
  sanityDocumentId?: string;
}

export interface DedupCheckResult {
  isDuplicate: boolean;
  matchedOn?: 'url' | 'title';
  existingRecord?: DedupRecord;
}

function normaliseUrl(url: string): string {
  try {
    const u = new URL(url.trim().toLowerCase());
    // Strip UTM and tracking params
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'].forEach(
      (p) => u.searchParams.delete(p),
    );
    return u.toString();
  } catch {
    return url.trim().toLowerCase();
  }
}

function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')   // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export class ArticleDedup {
  private readonly redis: Redis;

  constructor() {
    // Upstash Redis auto-reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
    this.redis = Redis.fromEnv();
  }

  private urlKey(url: string): string {
    return KEY_PREFIX_URL + sha256(normaliseUrl(url));
  }

  private titleKey(title: string): string {
    return KEY_PREFIX_TITLE + sha256(normaliseTitle(title));
  }

  /**
   * Returns true if we have seen this URL or title before.
   * Checks both keys; the first match wins and is returned.
   */
  async isDuplicate(url: string, title: string): Promise<DedupCheckResult> {
    const [urlRecord, titleRecord] = await Promise.all([
      this.redis.get<DedupRecord>(this.urlKey(url)),
      this.redis.get<DedupRecord>(this.titleKey(title)),
    ]);

    if (urlRecord) {
      return { isDuplicate: true, matchedOn: 'url', existingRecord: urlRecord };
    }
    if (titleRecord) {
      return { isDuplicate: true, matchedOn: 'title', existingRecord: titleRecord };
    }
    return { isDuplicate: false };
  }

  /**
   * Marks an article as seen. Writes both URL and title keys atomically via pipeline.
   * Should be called AFTER successful Sanity write so a failed publish doesn't
   * permanently block an article.
   */
  async markSeen(
    url: string,
    title: string,
    pipelineRunId: string,
    sanityDocumentId?: string,
  ): Promise<void> {
    const record: DedupRecord = {
      seenAt: new Date().toISOString(),
      pipelineRunId,
      ...(sanityDocumentId ? { sanityDocumentId } : {}),
    };

    const pipeline = this.redis.pipeline();
    pipeline.set(this.urlKey(url), record, { ex: DEDUP_TTL_SECONDS });
    pipeline.set(this.titleKey(title), record, { ex: DEDUP_TTL_SECONDS });
    await pipeline.exec();
  }

  /**
   * Bulk check – returns a map of guid → DedupCheckResult.
   * Use for RSS batch ingestion to avoid per-item round trips.
   */
  async bulkCheck(
    items: Array<{ guid: string; url: string; title: string }>,
  ): Promise<Map<string, DedupCheckResult>> {
    if (items.length === 0) return new Map();

    // Fetch all URL and title keys in two batched mget calls
    const urlKeys = items.map((i) => this.urlKey(i.url));
    const titleKeys = items.map((i) => this.titleKey(i.title));

    const [urlResults, titleResults] = await Promise.all([
      this.redis.mget<DedupRecord[]>(...urlKeys),
      this.redis.mget<DedupRecord[]>(...titleKeys),
    ]);

    const results = new Map<string, DedupCheckResult>();
    items.forEach((item, idx) => {
      const urlRecord = urlResults[idx];
      const titleRecord = titleResults[idx];
      if (urlRecord) {
        results.set(item.guid, { isDuplicate: true, matchedOn: 'url', existingRecord: urlRecord });
      } else if (titleRecord) {
        results.set(item.guid, {
          isDuplicate: true,
          matchedOn: 'title',
          existingRecord: titleRecord,
        });
      } else {
        results.set(item.guid, { isDuplicate: false });
      }
    });
    return results;
  }
}

