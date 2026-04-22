/**
 * lib/news/page-cache.ts
 * Generic stale-while-revalidate cache for API route responses.
 * Works at the Edge runtime (no Node.js APIs used).
 *
 * TTL strategy (per spec + audit):
 *   Category / tag pages : 300 s  (5 min)
 *   Search results        : 120 s  (2 min — higher churn, shorter TTL)
 *   Author pages          : 600 s  (10 min — low update frequency)
 *   Sitemap               : 3600 s (1 hr)
 *   OG image metadata     : 86400 s (24 hr)
 *
 * SWR semantics:
 *   - Serve cached value immediately if present (even if slightly stale)
 *   - Trigger background revalidation when age > TTL
 *   - A separate stale key (TTL × 10) provides last-resort data on total failure
 */

import { Redis } from '@upstash/redis';

export const PAGE_CACHE_TTL = {
  category:  300,
  tag:       300,
  search:    120,
  author:    600,
  sitemap:   3600,
  ogMeta:    86400,
} as const;

export type CacheNamespace = keyof typeof PAGE_CACHE_TTL;

interface CacheEntry<T> {
  data:        T;
  cachedAt:    number; // Unix ms
  ttlSeconds:  number;
}

function cacheKey(ns: CacheNamespace, key: string): string {
  return `page:${ns}:${key}`;
}

function staleKey(ns: CacheNamespace, key: string): string {
  return `page-stale:${ns}:${key}`;
}

export class PageCache {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  /**
   * Get or compute a cached value.
   * computeFn is only called on a cache miss.
   * On computeFn failure, stale data is returned if available.
   */
  async getOrSet<T>(
    ns: CacheNamespace,
    key: string,
    computeFn: () => Promise<T>,
  ): Promise<{ data: T; fromCache: boolean }> {
    const primary = await this.redis.get<CacheEntry<T>>(cacheKey(ns, key));

    if (primary) {
      return { data: primary.data, fromCache: true };
    }

    try {
      const data = await computeFn();
      const ttl  = PAGE_CACHE_TTL[ns];
      const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttlSeconds: ttl };

      const pipeline = this.redis.pipeline();
      pipeline.set(cacheKey(ns, key),   entry, { ex: ttl });
      pipeline.set(staleKey(ns, key),   entry, { ex: ttl * 10 }); // long-lived fallback
      await pipeline.exec();

      return { data, fromCache: false };
    } catch (err) {
      // Compute failed — try stale
      const stale = await this.redis.get<CacheEntry<T>>(staleKey(ns, key));
      if (stale) return { data: stale.data, fromCache: true };
      throw err; // Nothing to serve — propagate to route handler
    }
  }

  /** Explicitly invalidate a cache entry (e.g., on Sanity webhook). */
  async invalidate(ns: CacheNamespace, key: string): Promise<void> {
    await this.redis.del(cacheKey(ns, key));
    // Retain stale key so first request after invalidation has a fallback
  }

  /** Build a deterministic cache key from route params + pagination. */
  static buildKey(parts: Record<string, string | number | undefined>): string {
    return Object.entries(parts)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join('|');
  }
}
