import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, source = 'popup', category = 'general' } = await req.json().catch(() => ({}));

  if (!email || !String(email).includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const clean = String(email).toLowerCase().trim();
  const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app').replace(/\/$/, '');

  // ── 1. Neon: upsert subscriber ────────────────────────────────────────
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const existing = await sql`
      SELECT status FROM newsletter_subscribers WHERE email = ${clean}
    `;
    if (existing.length > 0) {
      if (existing[0].status === 'active') {
        return NextResponse.json({ success: true, message: 'already_subscribed' });
      }
      await sql`
        UPDATE newsletter_subscribers SET status = 'active', updated_at = NOW()
        WHERE email = ${clean}
      `;
    } else {
      await sql`
        INSERT INTO newsletter_subscribers (email, source, category)
        VALUES (${clean}, ${source}, ${category})
      `;
    }
  } catch (dbErr: any) {
    console.error('[Newsletter] Neon write failed:', dbErr.message);
    // Continue — don't block subscriber
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // ── 2. Resend: add to audience ────────────────────────────────────────
  if (audienceId) {
    try {
      await resend.contacts.create({
        email: clean,
        unsubscribed: false,
        audienceId,
      });
    } catch (e: any) {
      // "Contact already exists" is fine — not a real error
      if (!e?.message?.includes('already exists')) {
        console.warn('[Newsletter] Resend contact create failed:', e.message);
      }
    }
  }

  // ── 3. Send welcome email ─────────────────────────────────────────────
  const unsubscribeUrl = `${BASE}/api/newsletter/unsubscribe?email=${encodeURIComponent(clean)}`;

  try {
    await resend.emails.send({
      from: `CryptoBrainNews <newsletter@${process.env.RESEND_DOMAIN || 'cryptobrainnews.com'}>`,
      to: [clean],
      subject: '⚡ Welcome to the CryptoBrain Daily Brief',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="padding:0 0 32px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#FABF2C;padding:6px 12px;">
                  <span style="font-size:14px;font-weight:900;color:#000;letter-spacing:2px;">CB</span>
                </td>
                <td style="padding-left:12px;">
                  <span style="font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:2px;">CryptoBrain</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="border-left:3px solid #FABF2C;padding:0 0 0 24px;margin-bottom:32px;">
            <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:-1px;">
              You're In.
            </h1>
            <p style="font-size:14px;color:#FABF2C;margin:0;font-family:monospace;text-transform:uppercase;letter-spacing:2px;">
              Daily Brief — Confirmed
            </p>
          </td>
        </tr>
        <tr><td style="padding:32px 0;">
          <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0 0 16px 0;">
            Every morning you'll receive institutional-grade crypto intelligence — market analysis,
            onchain signals, and alpha calls — before the open.
          </p>
          <p style="font-size:15px;color:#ccc;line-height:1.7;margin:0;">
            First brief arrives tomorrow at <strong style="color:#FABF2C;">08:00 UTC</strong>.
          </p>
        </td></tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 0 40px 0;">
            <a href="${BASE}/news"
              style="display:inline-block;background:#FABF2C;color:#000;font-size:11px;font-weight:900;
                     text-transform:uppercase;letter-spacing:3px;padding:14px 28px;text-decoration:none;">
              Read Today's Intelligence →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #1a1a1a;padding:24px 0 0 0;">
            <p style="font-size:11px;color:#555;margin:0;font-family:monospace;">
              You subscribed at ${BASE} · 
              <a href="${unsubscribeUrl}" style="color:#555;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });
  } catch (emailErr: any) {
    console.error('[Newsletter] Welcome email failed:', emailErr.message);
    // Don't fail the request — subscriber is saved
  }

  return NextResponse.json({ success: true });
}
