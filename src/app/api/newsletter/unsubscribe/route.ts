import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';

const resend = new Resend(process.env.RESEND_API_KEY);

function renderPage(message: string, isError = false) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>CryptoBrainNews — Unsubscribe</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#050505;color:#fff;font-family:'Helvetica Neue',sans-serif;
         min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .card{max-width:440px;width:100%;border:1px solid #1a1a1a;padding:40px}
    .logo{display:flex;align-items:center;gap:10px;margin-bottom:32px}
    .logo-badge{background:#FABF2C;color:#000;font-size:12px;font-weight:900;
                padding:5px 10px;letter-spacing:2px}
    .logo-name{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:3px}
    h1{font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;
       margin-bottom:12px;color:${isError ? '#ff4757' : '#fff'}}
    p{font-size:13px;color:#888;line-height:1.7;margin-bottom:24px;font-family:monospace}
    a{display:inline-block;background:#FABF2C;color:#000;font-size:10px;font-weight:900;
      text-transform:uppercase;letter-spacing:3px;padding:12px 24px;text-decoration:none}
    a:hover{background:#fff}
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
    <a href="${(process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app').replace(/\/$/, '')}">
      Return to CryptoBrainNews →
    </a>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email || !email.includes('@')) {
    return new NextResponse(renderPage('Invalid or missing email address.', true), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const clean = decodeURIComponent(email).toLowerCase().trim();

  // ── 1. Update Neon ────────────────────────────────────────────────────
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed', updated_at = NOW()
      WHERE email = ${clean}
    `;
  } catch (dbErr: any) {
    console.error('[Unsubscribe] Neon update failed:', dbErr.message);
  }

  // ── 2. Remove from Resend audience ───────────────────────────────────
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    try {
      // List contacts to find the contact ID by email
      const { data } = await resend.contacts.list({ audienceId });
      const contact = data?.data?.find((c: any) => c.email === clean);
      if (contact?.id) {
        await resend.contacts.remove({ audienceId, id: contact.id });
      }
    } catch (e: any) {
      console.warn('[Unsubscribe] Resend remove failed:', e.message);
      // Still show success — Neon is updated
    }
  }

  return new NextResponse(
    renderPage(`${clean} has been removed from all CryptoBrainNews mailings. You won't hear from us again.`),
    { headers: { 'Content-Type': 'text/html' } }
  );
}
