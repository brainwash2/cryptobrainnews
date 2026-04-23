/**
 * middleware.ts
 * Next.js Edge Middleware — Pro subscription gate.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { Redis }                           from '@upstash/redis';

const SESSION_COOKIE   = process.env.SESSION_COOKIE_NAME ?? 'cbn_session';
const JWT_SECRET       = process.env.JWT_SECRET          ?? '';
const BASE_URL         = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryptobrainnews.com';

const PRO_ROUTE_PATTERNS = [
  /^\/pro\/dashboard/,
  /^\/pro\/exports/,
  /^\/pro\/alerts/,
  /^\/api\/pro\//,
  /^\/news\/.*\/export$/,
];

const PRO_PUBLIC_EXCEPTIONS = new Set([
  '/pro',
  '/pro/pricing',
  '/pro/success',
  '/pro/faq',
]);

const BYPASSED_PREFIXES = [
  '/api/webhooks/',
  '/api/og',
  '/api/cron/',
  '/_next/',
  '/favicon',
  '/affiliates/',
  '/public/',
];

const redis = Redis.fromEnv();

interface JWTPayload {
  sub:  string;
  exp:  number;
  tier?: string;
}

async function verifyJWT(token: string): Promise<JWTPayload | null> {
  if (!JWT_SECRET || !token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder   = new TextEncoder();
    const keyData   = encoder.encode(JWT_SECRET);
    const key       = await crypto.subtle.importKey(
      'raw', keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify'],
    );

    const data      = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0),
    );

    const valid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!valid) return null;

    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')),
    ) as JWTPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

interface CachedSub {
  tier:   string;
  status: string;
}

async function isProActive(userId: string): Promise<boolean | null> {
  try {
    const sub = await redis.get<CachedSub>(`sub:${userId}`);
    if (!sub) return null;
    return (
      (sub.tier === 'pro' || sub.tier === 'team') &&
      (sub.status === 'active' || sub.status === 'trialing')
    );
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (BYPASSED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const requiresPro =
    PRO_ROUTE_PATTERNS.some((r) => r.test(pathname)) &&
    !PRO_PUBLIC_EXCEPTIONS.has(pathname);

  if (!requiresPro) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value ?? '';
  const payload = await verifyJWT(token);

  if (!payload?.sub) {
    const loginUrl = new URL('/login', BASE_URL);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isPro = await isProActive(payload.sub);

  if (isPro === null) {
    const res = NextResponse.next();
    res.headers.set('x-sub-cache', 'miss');
    res.headers.set('x-user-id', payload.sub);
    return res;
  }

  if (!isPro) {
    const upgradeUrl = new URL('/pro', BASE_URL);
    upgradeUrl.searchParams.set('upgrade', 'true');
    upgradeUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(upgradeUrl);
  }

  const res = NextResponse.next();
  res.headers.set('x-sub-cache', 'hit');
  res.headers.set('x-user-id', payload.sub);
  res.headers.set('x-user-tier', 'pro');
  return res;
}

export const config = {
  matcher: [
    '/pro/:path*',
    '/api/pro/:path*',
    '/news/:slug*/export',
  ],
};
