/**
 * app/api/monetisation/portal/route.ts
 * Opens the Stripe Customer Portal for subscription management.
 *
 * POST body: { userId: string }
 * Returns:   { url: string }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createPortalSession }            from '../../../../lib/monetisation/portal';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { userId?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { userId } = body;
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const { url } = await createPortalSession(userId);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status  = message.includes('No Stripe customer') ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
