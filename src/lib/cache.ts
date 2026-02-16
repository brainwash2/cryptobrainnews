// src/lib/cache.ts
// ─── Hybrid Cache: RAM (L1) + Redis (L2) ─────────────────────────────────
import 'server-only';
import { Redis } from '@upstash/redis';

// 1. Initialize Redis
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

if (process.env.NODE_ENV === 'development') {
  console.log(redis ? "✅ [Redis] Connected" : "⚠️ [Redis] Not connected (Check .env.local)");
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const now = Date.now();
  const memoryKey = `mem:${key}`;

  // 1. L1 Memory
  const memEntry = memoryStore.get(memoryKey) as CacheEntry<T> | undefined;
  if (memEntry && now < memEntry.expiresAt) return memEntry.data;

  // Deduplicate
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;

  const promise = (async () => {
    try {
      // 2. L2 Redis
      if (redis) {
        const cachedData = await redis.get<T>(key);
        if (cachedData) {
          memoryStore.set(memoryKey, { data: cachedData, expiresAt: now + (ttlSeconds * 1000) });
          console.log(`[Cache] HIT (Redis): ${key}`);
          return cachedData;
        }
      }

      // 3. Fetch
      console.log(`[Cache] MISS: Fetching fresh data for ${key}`);
      const freshData = await fn();

      // 4. Save
      memoryStore.set(memoryKey, { data: freshData, expiresAt: now + (ttlSeconds * 1000) });
      if (redis) redis.set(key, freshData, { ex: ttlSeconds }).catch(console.error);

      return freshData;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
