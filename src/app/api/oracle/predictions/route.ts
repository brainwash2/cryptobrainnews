import { NextResponse } from 'next/server';
import { getLivePredictions } from '@/lib/predictions';

export const runtime = 'edge';
export const revalidate = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      error: 'Agent Authorization Required', 
      message: 'Access to the Alpha Oracle Prediction feed requires an API key.',
      upgrade_url: 'https://cryptobrainnews.vercel.app/alpha-guides',
      status_code: 401
    }, { status: 401 });
  }

  const signals = await getLivePredictions();

  return NextResponse.json({ 
    source: 'CryptoBrain Live Oracle', 
    type: 'prediction_arbitrage', 
    timestamp: new Date().toISOString(),
    count: signals.length,
    signals 
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
    }
  });
}
