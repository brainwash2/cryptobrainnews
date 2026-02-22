import 'server-only';
import { Redis } from '@upstash/redis';

const CHUNK_SIZE = 512 * 1024;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (now > entry.expiresAt) memoryStore.delete(key);
    }
  }, 60000).unref();
}

async function setRedisChunked<T>(key: string, data: T, ttl: number): Promise<void> {
  if (!redis) return;
  try {
    const serialized = JSON.stringify(data);
    if (serialized.length <= CHUNK_SIZE) {
      await redis.set(key, data, { ex: ttl });
      return;
    }
    const totalChunks = Math.ceil(serialized.length / CHUNK_SIZE);
    const pipeline = redis.pipeline();
    for (let i = 0; i < totalChunks; i++) {
      const chunk = serialized.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      pipeline.set(`${key}:chunk:${i}`, chunk, { ex: ttl + 60 });
    }
    pipeline.set(`${key}:meta`, { chunks: totalChunks }, { ex: ttl + 60 });
    await pipeline.exec();
  } catch (err) {
    console.error(`[Cache] Redis chunked write failed for ${key}:`, err);
  }
}

async function getRedisChunked<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const direct = await redis.get<T>(key);
    if (direct !== null && direct !== undefined) return direct;

    const meta = await redis.get<{ chunks: number }>(`${key}:meta`);
    if (!meta?.chunks) return null;

    const pipeline = redis.pipeline();
    for (let i = 0; i < meta.chunks; i++) {
      pipeline.get(`${key}:chunk:${i}`);
    }
    const results = await pipeline.exec();
    const serialized = results.map((r) => String(r ?? '')).join('');
    if (!serialized) return null;

    return JSON.parse(serialized) as T;
  } catch (err) {
    console.error(`[Cache] Redis chunked read failed for ${key}:`, err);
    return null;
  }
}

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const now = Date.now();
  const memKey = `mem:${key}`;

  const memEntry = memoryStore.get(memKey) as CacheEntry<T> | undefined;
  if (memEntry) {
    if (now < memEntry.expiresAt) return memEntry.data;
    memoryStore.delete(memKey);
  }

  if (inflight.has(key)) return inflight.get(key) as Promise<T>;

  const promise = (async (): Promise<T> => {
    try {
      const redisData = await getRedisChunked<T>(key);
      if (redisData !== null) {
        memoryStore.set(memKey, {
          data: redisData,
          expiresAt: now + ttlSeconds * 1000,
        });
        return redisData;
      }

      console.log(`[Cache] MISS: ${key}`);
      const freshData = await fn();

      memoryStore.set(memKey, {
        data: freshData,
        expiresAt: now + ttlSeconds * 1000,
      });
      setRedisChunked(key, freshData, ttlSeconds).catch(console.error);

      return freshData;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
