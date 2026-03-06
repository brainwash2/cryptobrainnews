import { NextResponse } from 'next/server';
import { getLivePrices } from '@/lib/api';
import { FALLBACK_MARKET_DATA } from '@/lib/fallback-data';

// Upstash fetch calls are dynamic, so this route must be dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prices = await getLivePrices();
    return NextResponse.json(prices || FALLBACK_MARKET_DATA);
  } catch (error) {
    return NextResponse.json(FALLBACK_MARKET_DATA);
  }
}
