import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export const runtime = 'edge';

// Fetch Operator's Referral Stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pubkey = searchParams.get('pubkey');

    if (!pubkey) {
      return NextResponse.json({ error: 'Missing pubkey' }, { status: 400 });
    }

    // Secure the query context for RLS
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Process a New Referral Conversion
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referrer, referred } = body;

    if (!referrer || !referred || referrer.toLowerCase() === referred.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid referral data' }, { status: 400 });
    }

    // 1. Verify Sybil Resistance via Gitcoin Passport
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
      // Sandbox fallback if keys are not set
      console.warn('[Referrals] Gitcoin keys missing. Simulating human verification for Sandbox.');
      score = 25; 
    }

    // 2. Gate Rewards: Score must be >= 20 to earn sats
    if (score < 20) {
      return NextResponse.json({ error: 'Sybil Risk: Gitcoin score too low for reward.', score }, { status: 403 });
    }

    // 3. Log the successful referral
    await sql`
      INSERT INTO referrals (referrer_pubkey, referred_pubkey, gitcoin_score, reward_sats)
      VALUES (${referrer}, ${referred}, ${score}, 5000)
      ON CONFLICT (referred_pubkey) DO NOTHING
    `;

    return NextResponse.json({ success: true, score, reward: 5000 });
  } catch (error) {
    console.error('[Referrals API] POST Error:', error);
    // Ignore unique constraint violations (already claimed)
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 });
  }
}
