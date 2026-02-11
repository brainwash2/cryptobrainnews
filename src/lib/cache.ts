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
    return existing.data;
  }

  try {
    const data = await fn();
    
    // Evict oldest if full
    if (store.size >= MAX_ENTRIES) {
      const firstKey = store.keys().next().value;
      if (firstKey) store.delete(firstKey);
    }

    store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return data;
  } catch (error) {
    console.error(`Cache fetch failed for ${key}`, error);
    throw error;
  }
}
