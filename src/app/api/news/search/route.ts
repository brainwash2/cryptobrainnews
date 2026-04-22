/**
 * app/api/news/search/route.ts
 * Edge-compatible full-text search over Sanity articles.
 *
 * Security:
 *   - Query sanitised (max 120 chars, stripped to alphanumeric + spaces/hyphens)
 *   - Rate-limited via Redis counter (60 req/min per IP)
 *
 * Caching:
 *   - Popular queries cached 2 min in Redis (search results are relatively stable)
 *   - No Vercel CDN caching for search (query is per-user, vary too high)
 *   - Very short stale window (20 min) to prevent stale search results
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis }           from '@upstash/redis';
import { PageCache }       from '../../../../lib/news/page-cache';
import { searchArticles }  from '../../../../lib/news/sanity-queries';

export const runtime = 'edge';

const cache     = new PageCache();
const redis     = Redis.fromEnv();
const MAX_QUERY_LEN = 120;
const RATE_LIMIT_WINDOW = 60;  // seconds
const RATE_LIMIT_MAX    = 60;  // requests per window

function sanitiseQuery(raw: string): string {
  return raw
    .slice(0, MAX_QUERY_LEN)
    .replace(/[^a-zA-Z0-9\s\-_.#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function isRateLimited(ip: string): Promise<boolean> {
  const key    = `rl:search:${ip}`;
  const count  = await redis.incr(key);
  if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
  return count > RATE_LIMIT_MAX;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(RATE_LIMIT_WINDOW) },
      },
    );
  }

  const rawQuery = req.nextUrl.searchParams.get('q') ?? '';
  const limit    = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? '20'), 50);
  const q        = sanitiseQuery(rawQuery);

  if (!q) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const key = PageCache.buildKey({ q, limit });

  try {
    const { data, fromCache } = await cache.getOrSet(
      'search',
      key,
      () => searchArticles(q, limit),
    );

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'X-Cache':      fromCache ? 'HIT' : 'MISS',
        'X-Query':      q,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('[search-route] error', { q, err });
    return NextResponse.json(
      { error: 'Search unavailable' },
      { status: 502 },
    );
  }
}
