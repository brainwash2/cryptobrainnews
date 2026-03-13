import { NextResponse } from 'next/server';
import { getL2ScalingData } from '@/lib/l2beat';

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET() {
  try {
    const l2Data = await getL2ScalingData();
    return NextResponse.json({ rollups: l2Data }, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch L2 data' }, { status: 500 });
  }
}
