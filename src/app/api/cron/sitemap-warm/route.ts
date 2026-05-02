// src/app/api/cron/sitemap-warm/route.ts
import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { validateVercelCronAuth }         from '../../../../lib/ops/cron-guard';
import { PageCache }                      from '../../../../lib/news/page-cache';
import { getSitemapArticles }             from '../../../../lib/news/sanity-queries';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryptobrainnews.com';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const unauth = validateVercelCronAuth(req);
  if (unauth) return unauth;

  const cache = new PageCache();

  const articles = await cache.getOrSet('sitemap', 'articles', () => getSitemapArticles());

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
