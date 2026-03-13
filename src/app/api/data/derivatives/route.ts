import { NextResponse } from 'next/server';
import { getDerivativesExchanges, getFundingRates } from '@/lib/derivatives';

export const runtime = 'edge';
export const revalidate = 300;

export async function GET() {
  try {
    const [exchanges, fundingRates] = await Promise.all([
      getDerivativesExchanges(),
      getFundingRates()
    ]);
    return NextResponse.json({ 
      exchanges: exchanges.slice(0, 20), 
      fundingRates: fundingRates.slice(0, 50) 
    }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch derivatives data' }, { status: 500 });
  }
}
