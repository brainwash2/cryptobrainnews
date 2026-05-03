import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { validateVercelCronAuth } from '../../../../lib/ops/cron-guard';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const unauthorised = validateVercelCronAuth(req);
  if (unauthorised) return unauthorised;

  const redis = Redis.fromEnv();
  const previousHealth = await redis.get<string>('pipeline:health');
  const previousFailureCount = await redis.get<number>('pipeline:consecutive-failures');
  const failureCount = typeof previousFailureCount === 'number' ? previousFailureCount : 0;

  await redis.del('pipeline:consecutive-failures');
  await redis.set('pipeline:health', 'healthy', { ex: 86400 });

  console.info('[ops] pipeline circuit reset', {
    who: 'cron-auth',
    when: new Date().toISOString(),
    previousState: {
      health: previousHealth ?? 'unknown',
      failureCount,
    },
  });

  return NextResponse.json({
    reset: true,
    previousState: {
      health: previousHealth ?? 'unknown',
      failureCount,
    },
    newState: {
      health: 'healthy' as const,
      failureCount: 0,
    },
  });
}
