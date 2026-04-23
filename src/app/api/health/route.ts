/**
 * app/api/health/route.ts
 * Comprehensive health check endpoint.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { Redis }                           from '@upstash/redis';
import { sanityHealthCheck }               from '../../../lib/news/sanity-client';
import { SocialScheduler }                 from '../../../lib/social/scheduler';
import { BroadcastQueue }                  from '../../../lib/news/broadcast-queue';

const CRON_SECRET = process.env.CRON_SECRET ?? '';

type SystemStatus = 'healthy' | 'degraded' | 'down' | 'unconfigured';

interface SystemCheck {
  status:    SystemStatus;
  latencyMs: number;
  message?:  string;
  checkedAt: string;
}

interface HealthReport {
  status:    'healthy' | 'degraded' | 'down';
  systems:   Record<string, SystemCheck>;
  version:   string;
  checkedAt: string;
}

async function checkRedis(): Promise<SystemCheck> {
  const start = Date.now();
  try {
    const redis  = Redis.fromEnv();
    const result = await redis.ping();
    return {
      status:    result === 'PONG' ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'down', latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : String(err),
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkSanity(): Promise<SystemCheck> {
  const start = Date.now();
  try {
    const ok = await sanityHealthCheck();
    return {
      status:    ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'down', latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : String(err),
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkTelegram(): Promise<SystemCheck> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { status: 'unconfigured', latencyMs: 0, checkedAt: new Date().toISOString() };

  const start = Date.now();
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: AbortSignal.timeout(8_000),
    });
    return {
      status:    res.ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      message:   res.ok ? undefined : `HTTP ${res.status}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'down', latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : String(err),
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkTwitter(): Promise<SystemCheck> {
  const bearer = process.env.TWITTER_BEARER_TOKEN;
  if (!bearer) return { status: 'unconfigured', latencyMs: 0, checkedAt: new Date().toISOString() };

  const start = Date.now();
  try {
    const res = await fetch('https://api.twitter.com/2/users/me', {
      signal:  AbortSignal.timeout(8_000),
      headers: { Authorization: `Bearer ${bearer}` },
    });
    return {
      status:    res.ok ? 'healthy' : (res.status === 429 ? 'degraded' : 'down'),
      latencyMs: Date.now() - start,
      message:   res.ok ? undefined : `HTTP ${res.status}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'down', latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : String(err),
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkStripe(): Promise<SystemCheck> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { status: 'unconfigured', latencyMs: 0, checkedAt: new Date().toISOString() };

  const start = Date.now();
  try {
    const res = await fetch('https://api.stripe.com/v1/account', {
      signal:  AbortSignal.timeout(8_000),
      headers: { Authorization: `Bearer ${key}` },
    });
    return {
      status:    res.ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      message:   res.ok ? undefined : `HTTP ${res.status}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'down', latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : String(err),
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkRSSFeeds(): Promise<SystemCheck> {
  const urls = (process.env.RSS_FEED_URLS ?? '').split(',').filter(Boolean);
  if (urls.length === 0) {
    return { status: 'unconfigured', latencyMs: 0, checkedAt: new Date().toISOString() };
  }

  const start   = Date.now();
  const results = await Promise.allSettled(
    urls.slice(0, 5).map((url) =>
      fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(6_000) }),
    ),
  );

  const failed  = results.filter((r) => r.status === 'rejected').length;
  const total   = results.length;

  return {
    status:    failed === 0 ? 'healthy' : failed < total ? 'degraded' : 'down',
    latencyMs: Date.now() - start,
    message:   failed > 0 ? `${failed}/${total} feeds unreachable` : undefined,
    checkedAt: new Date().toISOString(),
  };
}

async function checkPipelineLastRun(): Promise<SystemCheck> {
  const start = Date.now();
  try {
    const redis      = Redis.fromEnv();
    const lastRunRaw = await redis.get<string>('pipeline:last-success');

    if (!lastRunRaw) {
      return {
        status: 'degraded', latencyMs: Date.now() - start,
        message: 'No successful pipeline run recorded',
        checkedAt: new Date().toISOString(),
      };
    }

    const ageHours = (Date.now() - new Date(lastRunRaw).getTime()) / 3_600_000;
    return {
      status:    ageHours < 26 ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      message:   `Last success: ${lastRunRaw} (${ageHours.toFixed(1)}h ago)`,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'down', latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : String(err),
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkQueueDepths(): Promise<SystemCheck> {
  const start = Date.now();
  try {
    const scheduler = new SocialScheduler();
    const bqTg      = new BroadcastQueue();
    const bqNl      = new BroadcastQueue();

    const [pending, tgRetry, nlRetry] = await Promise.all([
      scheduler.pendingCounts(),
      bqTg.pendingCount('telegram'),
      bqNl.pendingCount('newsletter'),
    ]);

    const totalPending = Object.values(pending).reduce(
      (s: number, v: number) => s + v, 0
    );
    const totalRetry   = tgRetry + nlRetry;
    const degraded     = totalRetry > 50 || totalPending > 200;

    return {
      status:    degraded ? 'degraded' : 'healthy',
      latencyMs: Date.now() - start,
      message:   `Social pending: ${totalPending} | Broadcast retry: ${totalRetry}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'degraded', latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : String(err),
      checkedAt: new Date().toISOString(),
    };
  }
}

const CRITICAL_SYSTEMS = new Set(['redis', 'sanity']);

function aggregateStatus(systems: Record<string, SystemCheck>): HealthReport['status'] {
  const criticalDown = [...CRITICAL_SYSTEMS].some(
    (k) => systems[k]?.status === 'down',
  );
  if (criticalDown) return 'down';

  const anyDown = Object.values(systems).some((s) => s.status === 'down');
  if (anyDown) return 'degraded';

  const anyDegraded = Object.values(systems).some((s) => s.status === 'degraded');
  return anyDegraded ? 'degraded' : 'healthy';
}

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const detail = req.nextUrl.searchParams.get('detail') === 'true';
  const isAdmin = req.headers.get('x-cron-secret') === CRON_SECRET && CRON_SECRET !== '';

  const [redis, sanity, telegram, twitter, stripe, rss, pipeline, queues] =
    await Promise.all([
      checkRedis(),
      checkSanity(),
      checkTelegram(),
      checkTwitter(),
      checkStripe(),
      checkRSSFeeds(),
      checkPipelineLastRun(),
      checkQueueDepths(),
    ]);

  const systems: Record<string, SystemCheck> = {
    redis,
    sanity,
    telegram,
    twitter,
    stripe,
    rss_feeds: rss,
    pipeline_last_run: pipeline,
    queue_depths: queues,
  };

  const overallStatus = aggregateStatus(systems);

  const report: HealthReport = {
    status:    overallStatus,
    systems:   detail && isAdmin ? systems : Object.fromEntries(
      Object.entries(systems).map(([k, v]) => [k, { status: v.status, latencyMs: v.latencyMs, checkedAt: v.checkedAt }]),
    ),
    version:   process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    checkedAt: new Date().toISOString(),
  };

  const httpStatus = overallStatus === 'down' ? 503 : 200;

  return NextResponse.json(report, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store',
      'X-Health-Status': overallStatus,
    },
  });
}
