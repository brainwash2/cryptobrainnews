import { NextResponse } from 'next/server';
import { getDeFiProtocols } from '@/lib/api';

export const revalidate = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // For testing, we can temporarily disable auth or keep it as is.
  // We'll keep the auth check to mirror the predictions API.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      error: 'Agent Authorization Required', 
      message: 'Access to the Alpha Oracle Airdrop feed requires an API key.',
      upgrade_url: 'https://cryptobrainnews.vercel.app/alpha-guides',
      status_code: 401
    }, { status: 401 });
  }

  try {
    const protocols = await getDeFiProtocols();
    
    const tokenless = protocols
      .filter(p => 
        (!p.symbol || p.symbol === '-' || p.symbol.toLowerCase() === 'none') && 
        p.tvl > 5000000 &&
        p.category !== 'CEX' &&
        p.category !== 'Chain'
      )
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 50);

    const signals = tokenless.map(p => ({
      target_protocol: p.name,
      tvl_usd: p.tvl,
      network: p.chain || 'Multi',
      sector: p.category || 'DeFi',
      confidence_score: p.tvl > 100000000 ? 0.95 : 0.85,
      recommended_agent_action: 'bridge_and_provide_liquidity',
      sybil_risk_level: 'high',
      parameters: {
        min_volume_usd: 10000,
        randomize_delay_mins: 120
      }
    }));

    return NextResponse.json({ 
      source: 'CryptoBrain Oracle Engine', 
      type: 'airdrop_farming_vectors', 
      timestamp: new Date().toISOString(),
      count: signals.length, 
      signals 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process on-chain data' }, { status: 500 });
  }
}
