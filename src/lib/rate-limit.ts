import 'server-only';
import { Redis } from '@upstash/redis';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60_000
): Promise<boolean> {
  if (redis) {
    try {
      const count = await redis.incr(identifier);
      if (count === 1) {
        await redis.pexpire(identifier, windowMs);
      }
      return count > maxRequests;
    } catch (e) {
      console.warn('[RateLimit] Redis failed, falling back to memory');
    }
  }

  const now = Date.now();
  const entry = memoryStore.get(identifier);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}
