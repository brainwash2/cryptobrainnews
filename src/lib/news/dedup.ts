// src/lib/news/dedup.ts
import 'server-only';
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

const DEDUP_TTL_SECONDS = 7 * 24 * 60 * 60;
const KEY_PREFIX_URL     = 'dedup:url:';
const KEY_PREFIX_TITLE   = 'dedup:title:';
const KEY_PREFIX_CONTENT = 'dedup:content:';  // NEW: content‑snippet key

export interface DedupRecord {
  seenAt: string;
  pipelineRunId: string;
  sanityDocumentId?: string;
}

export interface DedupCheckResult {
  isDuplicate: boolean;
  matchedOn?: 'url' | 'title' | 'content';
  existingRecord?: DedupRecord;
}

function normaliseUrl(url: string): string {
  try {
    const u = new URL(url.trim().toLowerCase());
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
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalise the description for content‑snippet dedup.
 * Strips HTML, truncates to 300 bytes, lowercases.
 */
function normaliseContent(description: string): string {
  return description
    .replace(/<[^>]+>/g, '')    // strip HTML tags
    .replace(/\s+/g, ' ')       // collapse whitespace
    .trim()
    .toLowerCase()
    .slice(0, 300);              // first 300 bytes
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export class ArticleDedup {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  private urlKey(url: string): string {
    return KEY_PREFIX_URL + sha256(normaliseUrl(url));
  }

  private titleKey(title: string): string {
    return KEY_PREFIX_TITLE + sha256(normaliseTitle(title));
  }

  private contentKey(description: string): string {
    return KEY_PREFIX_CONTENT + sha256(normaliseContent(description));
  }

  /**
   * Returns true if we have seen this URL, title, OR content snippet before.
   * Checks all three keys; the first match wins and is returned.
   */
  async isDuplicate(url: string, title: string, description?: string): Promise<DedupCheckResult> {
    const keys: string[] = [
      this.urlKey(url),
      this.titleKey(title),
    ];
    if (description) {
      keys.push(this.contentKey(description));
    }

    const results = await Promise.all(
      keys.map((key) => this.redis.get<DedupRecord>(key)),
    );

    if (results[0]) {
      return { isDuplicate: true, matchedOn: 'url', existingRecord: results[0] };
    }
    if (results[1]) {
      return { isDuplicate: true, matchedOn: 'title', existingRecord: results[1] };
    }
    if (results[2]) {
      return { isDuplicate: true, matchedOn: 'content', existingRecord: results[2] };
    }
    return { isDuplicate: false };
  }

  /**
   * Marks an article as seen. Writes URL, title, AND content keys atomically.
   */
  async markSeen(
    url: string,
    title: string,
    pipelineRunId: string,
    sanityDocumentId?: string,
    description?: string,
  ): Promise<void> {
    const record: DedupRecord = {
      seenAt: new Date().toISOString(),
      pipelineRunId,
      ...(sanityDocumentId ? { sanityDocumentId } : {}),
    };

    const pipeline = this.redis.pipeline();
    pipeline.set(this.urlKey(url), record, { ex: DEDUP_TTL_SECONDS });
    pipeline.set(this.titleKey(title), record, { ex: DEDUP_TTL_SECONDS });
    if (description) {
      pipeline.set(this.contentKey(description), record, { ex: DEDUP_TTL_SECONDS });
    }
    await pipeline.exec();
  }

  async bulkCheck(
    items: Array<{ guid: string; url: string; title: string; description?: string }>,
  ): Promise<Map<string, DedupCheckResult>> {
    if (items.length === 0) return new Map();

    const urlKeys     = items.map((i) => this.urlKey(i.url));
    const titleKeys   = items.map((i) => this.titleKey(i.title));
    const contentKeys = items
      .filter((i) => !!i.description)
      .map((i) => this.contentKey(i.description!));

    const [urlResults, titleResults, contentResults] = await Promise.all([
      this.redis.mget<DedupRecord[]>(...urlKeys),
      this.redis.mget<DedupRecord[]>(...titleKeys),
      contentKeys.length > 0
        ? this.redis.mget<DedupRecord[]>(...contentKeys)
        : Promise.resolve([] as (DedupRecord | null)[]),
    ]);

    const results = new Map<string, DedupCheckResult>();
    items.forEach((item, idx) => {
      const urlRecord     = urlResults[idx];
      const titleRecord   = titleResults[idx];
      const contentRecord = contentResults[idx] ?? null;

      if (urlRecord) {
        results.set(item.guid, { isDuplicate: true, matchedOn: 'url', existingRecord: urlRecord });
      } else if (titleRecord) {
        results.set(item.guid, { isDuplicate: true, matchedOn: 'title', existingRecord: titleRecord });
      } else if (contentRecord) {
        results.set(item.guid, { isDuplicate: true, matchedOn: 'content', existingRecord: contentRecord });
      } else {
        results.set(item.guid, { isDuplicate: false });
      }
    });
    return results;
  }
}
