/**
 * Newsletter Subscribe Endpoint
 * POST /api/newsletter/subscribe
 * Body: { email: string, category?: string }
 *
 * Replace the TODO block with your email provider SDK:
 *   - Resend:      https://resend.com/docs/send-with-nextjs
 *   - ConvertKit:  https://developers.convertkit.com/#create-a-subscriber
 *   - Mailchimp:   https://mailchimp.com/developer/marketing/api/list-members/
 */
import { NextRequest, NextResponse } from 'next/server';
 
export async function POST(req: NextRequest) {
  const { email, category } = await req.json().catch(() => ({}));
 
  if (!email || !String(email).includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
 
  // TODO: replace with your email provider
  console.log(`[Newsletter] New subscriber: ${email} (category: ${category || 'general'})`);
 
  // Example Resend integration (uncomment and install resend):
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.contacts.create({ email, audienceId: process.env.RESEND_AUDIENCE_ID });
 
  return NextResponse.json({ success: true });
}
