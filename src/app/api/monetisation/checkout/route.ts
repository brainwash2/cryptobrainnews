/**
 * app/api/monetisation/checkout/route.ts
 * Creates a Stripe Checkout session and redirects the user.
 *
 * POST body: { userId: string, userEmail: string, plan: 'pro_monthly' | 'pro_yearly' }
 * Auth:      Session token via Authorization header or cookie (wire to your auth provider).
 *
 * Returns: { url: string } — caller should redirect to this URL.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, type PricePlan } from '../../../../lib/monetisation/stripe';

const VALID_PLANS = new Set<PricePlan>(['pro_monthly', 'pro_yearly']);

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { userId?: string; userEmail?: string; plan?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { userId, userEmail, plan } = body;

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  if (!userEmail || !userEmail.includes('@')) {
    return NextResponse.json({ error: 'Valid userEmail is required' }, { status: 400 });
  }
  if (!plan || !VALID_PLANS.has(plan as PricePlan)) {
    return NextResponse.json(
      { error: `plan must be one of: ${[...VALID_PLANS].join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const { url } = await createCheckoutSession(userId, userEmail, plan as PricePlan);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[checkout] error', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 });
  }
}
