// src/lib/cache.ts
// ─── In-Memory LRU Cache ──────────────────────────────────────────────────
// NOTE: On Vercel serverless, this cache is per-isolate and resets on cold starts.
// For persistent caching, integrate Redis/Upstash when ready.

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const MAX_ENTRIES = 200;

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const existing = store.get(key) as CacheEntry<T> | undefined;

  if (existing && Date.now() < existing.expiresAt) {
    // Move to end (LRU refresh) — Map preserves insertion order
    store.delete(key);
    store.set(key, existing);
    return existing.data;
  }

  try {
    const data = await fn();

    // Evict oldest entry if at capacity
    if (store.size >= MAX_ENTRIES) {
      const oldestKey = store.keys().next().value;
      if (oldestKey) store.delete(oldestKey);
    }

    store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return data;
  } catch (error) {
    // If we have stale data, return it rather than throwing
    if (existing) {
      console.warn(`[Cache] Returning stale data for "${key}"`);
      return existing.data;
    }
    console.error(`[Cache] Fetch failed for "${key}"`, error);
    throw error;
  }
}
