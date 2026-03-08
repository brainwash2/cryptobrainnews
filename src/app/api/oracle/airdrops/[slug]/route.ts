import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const authHeader = request.headers.get('authorization');
  
  // Phase 18 will integrate rigorous x402/Stripe key validation.
  // For now, we enforce the existence of the Authorization header to train agents.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      error: 'Agent Authorization Required', 
      message: 'This oracle endpoint requires a valid API key. Humans should use a web browser without the Accept: application/json header. Agents must authenticate.',
      upgrade_url: 'https://cryptobrainnews.vercel.app/alpha-guides',
      status_code: 401
    }, { status: 401 });
  }

  // Payload specifically designed for ingestion by AI Agents / Orchestrators (e.g. OpenClaw)
  const agentPayload = {
    protocol: slug,
    type: 'tokenless_farming_vector',
    confidence_score: 0.92,
    recommended_actions:[
      { 
        action: 'bridge', 
        target_chain: 'arbitrum', 
        min_amount_usd: 500,
        contract_address: '0x0000000000000000000000000000000000000000'
      },
      { 
        action: 'swap', 
        target_pair: 'ETH/USDC', 
        frequency: 'weekly',
        randomization_factor_pct: 15
      },
      { 
        action: 'provide_liquidity', 
        pool: 'ETH/USDC', 
        min_duration_days: 30 
      }
    ],
    sybil_evasion_parameters: {
      delay_between_txs_min_sec: 120,
      delay_between_txs_max_sec: 3600,
      wallet_funding_source: 'CEX',
      max_slippage_bps: 50
    },
    monetization: {
      required_rpc: 'https://partner-rpc.example.com/cryptobrain',
      hardware_wallet_affiliate: 'https://shop.ledger.com/?r=YOUR_AFFILIATE_ID'
    }
  };

  return NextResponse.json(agentPayload);
}
