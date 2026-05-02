// src/app/api/cron/health/route.ts
import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { validateVercelCronAuth }         from '../../../../lib/ops/cron-guard';
import { Redis }                           from '@upstash/redis';
import { OpsAlerter }                      from '../../../../lib/ops/alerts';
import { BroadcastQueue }                  from '../../../../lib/news/broadcast-queue';

const BASE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryptobrainnews.com';
const PREV_DOWN_KEY = 'health:prev-down';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const unauth = validateVercelCronAuth(req);
  if (unauth) return unauth;

  const alerter = new OpsAlerter();
  const redis   = Redis.fromEnv();

  const healthRes = await fetch(`${BASE_URL}/api/health?detail=true`, {
    headers: {
      'Cache-Control':  'no-store',
    },
    signal: AbortSignal.timeout(30_000),
  });

  const report = (await healthRes.json()) as {
    status:  string;
    systems: Record<string, { status: string; latencyMs: number; message?: string }>;
  };

  const prevDownRaw = await redis.get<string>(PREV_DOWN_KEY).catch(() => null);
  const prevDown    = new Set<string>(prevDownRaw ? JSON.parse(prevDownRaw) : []);
  const currentDown = new Set<string>();

  for (const [system, check] of Object.entries(report.systems)) {
    if (check.status === 'down' || check.status === 'degraded') {
      currentDown.add(system);

      if (!prevDown.has(system)) {
        await alerter.healthAlert({
          system,
          message: check.message ?? `${system} is ${check.status}`,
          latency: check.latencyMs,
        });
      }
    }

    if (prevDown.has(system) && !currentDown.has(system)) {
      await alerter.recoveryNotice(system);
    }
  }

  const bq = new BroadcastQueue();
  const [tgDepth, nlDepth] = await Promise.all([
    bq.pendingCount('telegram'),
    bq.pendingCount('newsletter'),
  ]);

  if (tgDepth > 20) await alerter.deadLetterAlert({ count: tgDepth,  channel: 'telegram' });
  if (nlDepth > 20) await alerter.deadLetterAlert({ count: nlDepth, channel: 'newsletter' });

  await redis.set(PREV_DOWN_KEY, JSON.stringify([...currentDown]), { ex: 60 * 60 });

  return NextResponse.json({
    ok:          report.status !== 'down',
    status:      report.status,
    downSystems: [...currentDown],
    checkedAt:   new Date().toISOString(),
  });
}
