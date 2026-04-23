/**
 * app/api/cron/sitemap-warm/route.ts
 * Warms the sitemap Redis cache every hour so /sitemap.xml is always fast.
 * Also pre-warms the most recent 5 article OG images via self-fetch.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { PageCache }                      from '../../../../lib/news/page-cache';
import { getSitemapArticles }             from '../../../../lib/news/sanity-queries';

const CRON_SECRET = process.env.CRON_SECRET ?? '';
const BASE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryptobrainnews.com';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get('authorization') !== `Bearer ${CRON_SECRET}` || !CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const cache = new PageCache();

  // Re-warm sitemap data
  const articles = await cache.getOrSet('sitemap', 'articles', () => getSitemapArticles());

  // Pre-warm OG images for the 5 most recent articles (fire-and-forget)
  const recent = articles.data.slice(0, 5);
  void Promise.allSettled(
    recent.map(({ slug }: { slug: string }) =>
      fetch(`${BASE_URL}/api/og?slug=${encodeURIComponent(slug)}`, { method: 'GET' }),
    ),
  );

  return NextResponse.json({
    ok:             true,
    articlesCached: articles.data.length,
    ogPrewarmed:    recent.length,
    at:             new Date().toISOString(),
  });
}
