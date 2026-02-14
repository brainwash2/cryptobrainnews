import { NextResponse } from 'next/server';
import { getLivePrices } from '@/lib/api';
import { FALLBACK_MARKET_DATA } from '@/lib/fallback-data';

export async function GET() {
  try {
    const prices = await getLivePrices();
    return NextResponse.json(prices || FALLBACK_MARKET_DATA);
  } catch (error) {
    return NextResponse.json(FALLBACK_MARKET_DATA);
  }
}
