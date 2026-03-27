import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
 
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;
 
export const revalidate = 300;
 
export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') || '10');
  const period = req.nextUrl.searchParams.get('period') || 'all'; // all | YYYY-MM-DD
 
  if (!redis) return NextResponse.json({ popular: [], source: 'no-redis' });
 
  try {
    const key = period === 'all' ? 'analytics:views:all' : `analytics:views:${period}`;
    const entries = await redis.zrange(key, 0, limit - 1, { rev: true, withScores: true });
 
    const popular = [];
    for (let i = 0; i < entries.length; i += 2) {
      const id = entries[i] as string;
      const views = Number(entries[i + 1]);
      const meta = await redis.hgetall(`analytics:meta:${id}`).catch(() => ({}));
      popular.push({ id, views, ...(meta || {}) });
    }
 
    return NextResponse.json({ popular, period });
  } catch (err: any) {
    return NextResponse.json({ popular: [], error: err.message });
  }
}
