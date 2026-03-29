import { NextResponse } from 'next/server';
 
export const runtime = 'edge';
export const revalidate = 0;
 
async function checkFeed(url: string, label: string) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'CryptoBrainNews/HealthCheck' },
    });
    return { label, status: res.ok ? 'ok' : 'error', code: res.status };
  } catch (e: any) {
    return { label, status: 'error', error: e.message };
  }
}
 
async function checkSanity() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  if (!projectId || projectId === 'REPLACE_ME') return { status: 'not_configured' };
  try {
    const res = await fetch(
      `https://${projectId}.api.sanity.io/v2024-03-04/data/query/${dataset}?query=count(*[_type%3D%3D"post"])`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return { status: 'ok', postCount: data.result };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}
 
export async function GET() {
  const start = Date.now();
 
  const [
    cointelegraph,
    coindesk,
    theblock,
    thedefiant,
    sanity,
  ] = await Promise.all([
    checkFeed('https://cointelegraph.com/rss', 'Cointelegraph'),
    checkFeed('https://www.coindesk.com/arc/outboundfeeds/rss/', 'CoinDesk'),
    checkFeed('https://www.theblock.co/rss.xml', 'The Block'),
    checkFeed('https://thedefiant.io/feed/', 'The Defiant'),
    checkSanity(),
  ]);
 
  const feeds = [cointelegraph, coindesk, theblock, thedefiant];
  const feedsOk = feeds.filter(f => f.status === 'ok').length;
 
  const health = {
    status: feedsOk >= 2 && sanity.status !== 'error' ? 'ok' : 'degraded',
    ts: new Date().toISOString(),
    durationMs: Date.now() - start,
    version: process.env.npm_package_version || '1.0.0',
    env: {
      sanityConfigured: !!(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'REPLACE_ME'),
      redisConfigured: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
      groqConfigured: !!process.env.GROQ_API_KEY,
      adminSecretSet: !!process.env.ADMIN_SECRET,
      resendConfigured: !!(process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID),
      neonConfigured: !!process.env.DATABASE_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    },
    feeds,
    sanity,
  };
 
  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 207,
  });
}
