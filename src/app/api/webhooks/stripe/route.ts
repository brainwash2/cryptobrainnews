/**
 * app/api/webhooks/stripe/route.ts
 * Stripe webhook endpoint.
 *
 * CRITICAL: Must use the raw request body for signature verification.
 * Next.js App Router returns ReadableStream — we must buffer it manually.
 * Do NOT parse with req.json() before verifying the signature.
 *
 * Idempotency: Stripe may retry webhooks. handleWebhookEvent() uses
 * Redis to persist subscription state (last-write-wins is safe for
 * subscription events since Stripe sends them in order).
 */

import { type NextRequest, NextResponse } from 'next/server';
import { handleWebhookEvent }             from '../../../../lib/monetisation/stripe';

// Disable Next.js body parsing — required for Stripe signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // Buffer the raw body as a string
  let rawBody: string;
  try {
    const buffer = await req.arrayBuffer();
    rawBody = new TextDecoder('utf-8').decode(buffer);
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  try {
    const { handled, event } = await handleWebhookEvent(rawBody, signature);
    return NextResponse.json({ received: true, handled, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // 400 on invalid signature (tells Stripe to stop retrying this exact payload)
    if (message.includes('signature')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // 500 on processing errors (tells Stripe to retry)
    console.error('[stripe-webhook] processing error', { message });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
