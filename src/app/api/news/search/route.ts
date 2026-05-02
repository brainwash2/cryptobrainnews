// src/app/api/news/search/route.ts
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { PageCache }       from '../../../../lib/news/page-cache';
import { searchArticles }  from '../../../../lib/news/sanity-queries';
import { checkRateLimit }  from '@/lib/rate-limit';

export const runtime = 'edge';

const cache     = new PageCache();
const MAX_QUERY_LEN = 120;

function sanitiseQuery(raw: string): string {
  return raw
    .slice(0, MAX_QUERY_LEN)
    .replace(/[^a-zA-Z0-9\s\-_.#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── Rate limit: 60 requests/min/IP ──────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (await checkRateLimit(`search:${ip}`, 60, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
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