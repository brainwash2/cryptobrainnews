import 'server-only';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store fallback
const store = new Map<string, RateLimitEntry>();

// Prevent memory leaks by sweeping expired rate-limit records
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000).unref();
}

/**
 * Simple rate limiter.
 * @returns true if the request should be BLOCKED
 */
export function isRateLimited(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}
