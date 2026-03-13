import { NextResponse } from 'next/server';
import { getStablecoins, getProtocolFees } from '@/lib/api';

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET() {
  try {
    const [stablecoins, fees] = await Promise.all([
      getStablecoins(),
      getProtocolFees()
    ]);
    return NextResponse.json({ stablecoins: stablecoins.slice(0, 50), fees: fees.slice(0, 50) }, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch DeFi data' }, { status: 500 });
  }
}
