// src/app/api/webhooks/stripe/route.ts
import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { handleWebhookEvent }             from '../../../../lib/monetisation/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

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

    if (message.includes('signature')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error('[stripe-webhook] processing error', { message });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
