// src/lib/ops/cron-guard.ts
import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Validates the CRON_SECRET against the request.
 * Reads from x‑cron‑secret header first, then ?secret= query param.
 * Returns a 401 NextResponse if missing or mismatched, otherwise null.
 *
 * Usage:
 *   const unauthorised = validateCronSecret(req);
 *   if (unauthorised) return unauthorised;
 */
export function validateCronSecret(
  req: NextRequest
): NextResponse | null {
  const CRON_SECRET = process.env.CRON_SECRET;

  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured on server' },
      { status: 500 }
    );
  }

  const headerSecret = req.headers.get('x-cron-secret');
  const paramSecret  = req.nextUrl.searchParams.get('secret');
  const provided     = headerSecret ?? paramSecret;

  if (!provided || provided !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    );
  }

  return null; // all good
}

/**
 * Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
 * Some existing routes use this pattern. This helper validates that format.
 */
export function validateVercelCronAuth(
  req: NextRequest
): NextResponse | null {
  const CRON_SECRET = process.env.CRON_SECRET;

  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured on server' },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization');
  const expected   = `Bearer ${CRON_SECRET}`;

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    );
  }

  return null;
}
