import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { SiweMessage } from 'siwe';

export const runtime = 'edge';

// Fetch Operator's Referral Stats (Secured with SIWE)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pubkey = searchParams.get('pubkey');
    const signature = request.headers.get('x-siwe-signature');
    const messageStr = request.headers.get('x-siwe-message');

    if (!pubkey || !signature || !messageStr) {
      return NextResponse.json({ error: 'Missing authentication headers or pubkey' }, { status: 401 });
    }

    // 1. Cryptographic Verification (SIWE)
    const siweMessage = new SiweMessage(messageStr);
    const { data } = await siweMessage.verify({ signature });
    
    if (data.address.toLowerCase() !== pubkey.toLowerCase()) {
      return NextResponse.json({ error: 'Signature address mismatch' }, { status: 403 });
    }

    // 2. Secure the query context
    const results = await sql.transaction([
      sql`SELECT set_config('operator.current_pubkey', ${pubkey}::text, true)`,
      sql`
        SELECT 
          COUNT(*)::int as total_referrals, 
          COALESCE(SUM(reward_sats), 0)::int as total_sats
        FROM referrals 
        WHERE lower(referrer_pubkey) = lower(${pubkey})
      `
    ]);

    return NextResponse.json(results[1][0]);
  } catch (error) {
    console.error('[Referrals API] GET Error:', error);
    return NextResponse.json({ error: 'Unauthorized or Internal Error' }, { status: 401 });
  }
}

// Process a New Referral Conversion (Called by system, no SIWE needed)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referrer, referred } = body;

    if (!referrer || !referred || referrer.toLowerCase() === referred.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid referral data' }, { status: 400 });
    }

    let score = 0;
    const apiKey = process.env.GITCOIN_SCORER_API_KEY;
    const scorerId = process.env.GITCOIN_SCORER_ID;

    if (apiKey && scorerId) {
      const gitcoinRes = await fetch(`https://api.scorer.gitcoin.co/registry/score/${scorerId}/${referred}`, {
        headers: { 'X-API-KEY': apiKey }
      });
      if (gitcoinRes.ok) {
        const data = await gitcoinRes.json();
        score = Math.floor(data.score || 0);
      }
    } else {
      score = 25; 
    }

    if (score < 20) {
      return NextResponse.json({ error: 'Sybil Risk: Gitcoin score too low for reward.', score }, { status: 403 });
    }

    await sql.transaction([
      sql`SELECT set_config('operator.current_pubkey', ${referrer}::text, true)`,
      sql`
        INSERT INTO referrals (referrer_pubkey, referred_pubkey, gitcoin_score, reward_sats)
        VALUES (${referrer}, ${referred}, ${score}, 5000)
        ON CONFLICT (referred_pubkey) DO NOTHING
      `
    ]);

    return NextResponse.json({ success: true, score, reward: 5000 });
  } catch (error) {
    console.error('[Referrals API] POST Error:', error);
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 });
  }
}
