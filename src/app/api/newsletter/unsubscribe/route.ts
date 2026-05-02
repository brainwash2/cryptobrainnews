// src/app/api/newsletter/unsubscribe/route.ts
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';

const resend = new Resend(process.env.RESEND_API_KEY);

function renderPage(message: string, isError = false, email = '') {
  const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app').replace(/\/$/, '');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CryptoBrainNews — Unsubscribe</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;color:#f8fafc;font-family:system-ui,sans-serif;
         min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .card{max-width:460px;width:100%;border:1px solid #27272a;border-radius:16px;padding:40px;background:#161616}
    .logo{display:flex;align-items:center;gap:10px;margin-bottom:32px}
    .logo-badge{background:#22c55e;color:#0a0a0a;font-size:12px;font-weight:700;
                padding:6px 12px;letter-spacing:2px;border-radius:8px}
    .logo-name{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#f8fafc}
    h1{font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:-0.5px;
       margin-bottom:12px;color:${isError ? '#ef4444' : '#f8fafc'}}
    p{font-size:13px;color:#a3a3a3;line-height:1.7;margin-bottom:24px;font-family:monospace}
    a{display:inline-block;background:#22c55e;color:#0a0a0a;font-size:11px;font-weight:700;
      text-transform:uppercase;letter-spacing:2px;padding:12px 24px;text-decoration:none;border-radius:8px}
    a:hover{background:#f8fafc}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-badge">CB</div>
      <div class="logo-name">CryptoBrain</div>
    </div>
    <h1>${isError ? 'Something went wrong' : 'Unsubscribed'}</h1>
    <p>${message}</p>
    <a href="${BASE}">Return to CryptoBrainNews →</a>
    ${email ? `<p style="margin-top:12px;font-size:11px;color:#52525b">Email: ${email}</p>` : ''}
  </div>
</body>
</html>`;
}

/**
 * GET /api/newsletter/unsubscribe?email=user@example.com
 *
 * GDPR‑compliant one‑click unsubscribe:
 *   - No login required
 *   - Verifies email parameter matches a subscriber
 *   - Records the timestamp of the unsubscribe in Neon
 *   - Removes from Resend audience
 */
export async function GET(req: NextRequest) {
  const emailParam = req.nextUrl.searchParams.get('email');

  if (!emailParam || !emailParam.includes('@')) {
    return new NextResponse(renderPage('Invalid or missing email address.', true), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const clean = decodeURIComponent(emailParam).toLowerCase().trim();

  let found = false;

  // ── 1. Verify email exists + update Neon ───────────────────────────────
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const existing = await sql`
      SELECT email, status FROM newsletter_subscribers WHERE email = ${clean}
    `;

    if (existing.length === 0) {
      return new NextResponse(
        renderPage(`The email address ${clean} was not found in our subscriber list. It may have already been removed.`, false, clean),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    found = true;

    // Record unsubscribe with timestamp
    await sql`
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed', updated_at = NOW()
      WHERE email = ${clean}
    `;
  } catch (dbErr: unknown) {
    const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
    console.error('[Unsubscribe] Neon update failed:', message);
  }

  // ── 2. Remove from Resend audience ────────────────────────────────────
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    try {
      const { data } = await resend.contacts.list({ audienceId });
      const contact = data?.data?.find((c: { email: string; id?: string }) => c.email === clean);
      if (contact?.id) {
        await resend.contacts.remove({ audienceId, id: contact.id });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.warn('[Unsubscribe] Resend remove failed:', message);
    }
  }

  return new NextResponse(
    renderPage(
      found
        ? `${clean} has been removed from all CryptoBrainNews mailings. You won't hear from us again.`
        : `${clean} could not be found. It may have already been removed.`,
      false,
      clean
    ),
    { headers: { 'Content-Type': 'text/html' } }
  );
}