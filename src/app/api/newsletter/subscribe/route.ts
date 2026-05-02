// src/app/api/newsletter/subscribe/route.ts
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';
import { checkRateLimit } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  // ── Rate limit: 3 requests/hour/IP ───────────────────────────────────
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  if (await checkRateLimit(`nl:subscribe:${ip}`, 3, 3_600_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const { email, source = 'popup', category = 'general' } = await req.json().catch(() => ({}));

  if (!email || !String(email).includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const clean = String(email).toLowerCase().trim();
  const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app').replace(/\/$/, '');

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
  } catch (dbErr: unknown) {
    const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
    console.error('[Newsletter] Neon write failed:', message);
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (audienceId) {
    try {
      await resend.contacts.create({
        email: clean,
        unsubscribed: false,
        audienceId,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      if (!message.includes('already exists')) {
        console.warn('[Newsletter] Resend contact create failed:', message);
      }
    }
  }

  const unsubscribeUrl = `${BASE}/api/newsletter/unsubscribe?email=${encodeURIComponent(clean)}`;

  try {
    await resend.emails.send({
      from: `CryptoBrainNews <${process.env.RESEND_DOMAIN ? `newsletter@${process.env.RESEND_DOMAIN}` : 'onboarding@resend.dev'}>`,
      to: [clean],
      subject: '⚡ Welcome to the CryptoBrain Daily Brief',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0a0a0a;color:#f8fafc;font-family:sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><tr><td style="padding:0 0 32px 0"><span style="background:#22c55e;color:#0a0a0a;padding:6px 12px;font-size:14px;font-weight:700;letter-spacing:2px">CB</span><span style="padding-left:12px;font-size:16px;font-weight:700;color:#f8fafc;text-transform:uppercase;letter-spacing:2px">CryptoBrain</span></td></tr><tr><td style="border-left:3px solid #22c55e;padding:0 0 0 24px"><h1 style="font-size:28px;font-weight:700;color:#f8fafc;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:-1px">You're In.</h1><p style="font-size:14px;color:#22c55e;margin:0;font-family:monospace;text-transform:uppercase;letter-spacing:2px">Daily Brief — Confirmed</p></td></tr><tr><td style="padding:32px 0"><p style="font-size:15px;color:#a3a3a3;line-height:1.7;margin:0 0 16px 0">Every morning you'll receive institutional-grade crypto intelligence — market analysis, onchain signals, and alpha calls — before the open.</p></td></tr><tr><td style="padding:0 0 40px 0"><a href="${BASE}/news" style="display:inline-block;background:#22c55e;color:#0a0a0a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;padding:14px 28px;text-decoration:none;border-radius:8px">Read Today's Intelligence →</a></td></tr><tr><td style="border-top:1px solid #27272a;padding:24px 0 0 0"><p style="font-size:11px;color:#52525b;margin:0;font-family:monospace">You subscribed at ${BASE} · <a href="${unsubscribeUrl}" style="color:#52525b">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`,
    });
  } catch (emailErr: unknown) {
    const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
    console.error('[Newsletter] Welcome email failed:', message);
  }

  return NextResponse.json({ success: true });
}