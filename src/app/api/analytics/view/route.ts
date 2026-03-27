/**
 * Article View Counter
 * POST /api/analytics/view
 * Body: { articleId: string, title: string, category: string }
 *
 * Uses Upstash Redis sorted sets for zero-cost view counting.
 * If Redis is not configured, silently no-ops.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
 
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;
 
export async function POST(req: NextRequest) {
  if (!redis) return NextResponse.json({ tracked: false });
 
  const { articleId, title, category } = await req.json().catch(() => ({}));
  if (!articleId) return NextResponse.json({ error: 'articleId required' }, { status: 400 });
 
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    await Promise.all([
      redis.zincrby('analytics:views:all', 1, articleId),
      redis.zincrby(`analytics:views:${today}`, 1, articleId),
      redis.hset(`analytics:meta:${articleId}`, { title: title || articleId, category: category || 'unknown' }),
    ]);
    return NextResponse.json({ tracked: true });
  } catch (err: any) {
    console.warn('[Analytics] Redis write failed:', err.message);
    return NextResponse.json({ tracked: false });
  }
}
