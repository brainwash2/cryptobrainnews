/**
 * app/api/monetisation/analytics/route.ts
 * Returns affiliate analytics for the admin dashboard.
 *
 * GET /api/monetisation/analytics?partners=ledger,bybit,binance&days=30
 *
 * Auth: CRON_SECRET header (admin-only — never expose to browser).
 */

import { type NextRequest, NextResponse } from 'next/server';
import { AffiliateAnalytics }             from '../../../../lib/monetisation/analytics';
import { AffiliateInjector }              from '../../../../lib/monetisation/affiliate';
import { getSitemapArticles }             from '../../../../lib/news/sanity-queries';

const CRON_SECRET = process.env.CRON_SECRET ?? '';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get('x-cron-secret');
  if (auth !== CRON_SECRET || !CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const partnersParam = req.nextUrl.searchParams.get('partners') ?? '';
  const days          = Math.min(Number(req.nextUrl.searchParams.get('days') ?? '30'), 90);

  const allPartnerIds = AffiliateInjector.all.map((p) => p.id);
  const partnerIds    = partnersParam
    ? partnersParam.split(',').filter((id) => allPartnerIds.includes(id))
    : allPartnerIds;

  const analytics = new AffiliateAnalytics();

  // Fetch all slugs for article-level stats
  const articleMetas = await getSitemapArticles().catch(() => []);
  const articleSlugs = articleMetas.map((a) => a.slug);

  const summaries = await Promise.all(
    partnerIds.map((id) => analytics.getPartnerSummary(id, articleSlugs)),
  );

  const totals = await analytics.getTotalStats(partnerIds);

  return NextResponse.json({
    partners:       summaries,
    totals,
    generatedAt:    new Date().toISOString(),
    days,
  });
}
