import { NextResponse } from 'next/server';
import { getLivePrices, FALLBACK_MARKET_DATA } from '@/lib/api';

export async function GET() {
  try {
    // Force fetching from server-side logic
    const prices = await getLivePrices('usd', 'all');
    if (!prices || prices.length === 0) {
      return NextResponse.json(FALLBACK_MARKET_DATA);
    }
    return NextResponse.json(prices);
  } catch (error) {
    return NextResponse.json(FALLBACK_MARKET_DATA);
  }
}
