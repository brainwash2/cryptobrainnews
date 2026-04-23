/**
 * app/api/monetisation/analytics/track/route.ts
 * Records an affiliate click then issues a 302 redirect to the partner URL.
 *
 * Usage (from AffiliateDashboard link):
 *   /api/monetisation/analytics/track?partner=ledger&slug=bitcoin-sopr-april-2026&position=footer
 */

import { type NextRequest, NextResponse } from 'next/server';
import { AffiliateAnalytics }             from '../../../../../lib/monetisation/analytics';
import { AffiliateInjector }              from '../../../../../lib/monetisation/affiliate';

export const runtime = 'edge';

const analytics = new AffiliateAnalytics();

export async function GET(req: NextRequest): Promise<NextResponse> {
  const partnerId   = req.nextUrl.searchParams.get('partner')  ?? '';
  const articleSlug = req.nextUrl.searchParams.get('slug')     ?? 'unknown';
  const positionRaw = req.nextUrl.searchParams.get('position') ?? 'footer';
  const position    = (['footer', 'inline', 'sidebar'] as const).includes(
    positionRaw as 'footer' | 'inline' | 'sidebar',
  )
    ? (positionRaw as 'footer' | 'inline' | 'sidebar')
    : 'footer';

  const partner = AffiliateInjector.getPartner(partnerId);
  if (!partner) {
    return NextResponse.json({ error: 'Unknown partner' }, { status: 400 });
  }

  const event = {
    partnerId,
    articleSlug,
    position,
    referrer:  req.headers.get('referer')     ?? undefined,
    userAgent: req.headers.get('user-agent')  ?? undefined,
    ip:        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined,
    timestamp: new Date().toISOString(),
  };

  // Fire-and-forget — tracking must never block the redirect
  void analytics.trackClick(event).catch(() => {});

  return NextResponse.redirect(partner.url, { status: 302 });
}
