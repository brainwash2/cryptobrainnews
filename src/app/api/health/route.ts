import { NextResponse } from 'next/server';
 
export const runtime = 'edge';
export const revalidate = 0;
 
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    ts: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    env: {
      sanity: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      redis: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
      groq: !!process.env.GROQ_API_KEY,
      adminSecret: !!process.env.ADMIN_SECRET,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    },
  });
}
