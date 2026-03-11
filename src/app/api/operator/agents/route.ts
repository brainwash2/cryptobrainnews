import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pubkey = searchParams.get('pubkey');

    if (!pubkey) {
      return NextResponse.json({ error: 'Missing pubkey parameter' }, { status: 400 });
    }

    // In a production app, we would verify a cryptographic signature (SIWE) here.
    // For MVP, we fetch the agents registered to this specific wallet address.
    const agents = await sql`
      SELECT id, agent_name, created_at
      FROM agent_identities 
      WHERE lower(pubkey) = lower(${pubkey})
      ORDER BY created_at DESC
    `;

    // Fetch execution stats for these agents
    let stats = { total_execs: 0, total_sats: 0 };
    if (agents.length > 0) {
      const agentIds = agents.map(a => a.id);
      
      // We use a batched transaction array to get aggregations safely
      const results = await sql.transaction([
        sql`SELECT COUNT(*)::int as execs FROM execution_logs WHERE agent_id = ANY(${agentIds}) AND status = 'settled'`,
        sql`SELECT COALESCE(SUM(cost_sats), 0)::int as sats FROM execution_logs WHERE agent_id = ANY(${agentIds}) AND status = 'settled'`
      ]);
      
      stats.total_execs = results[0][0].execs;
      stats.total_sats = results[1][0].sats;
    }

    return NextResponse.json({ 
      agents,
      stats 
    });

  } catch (error) {
    console.error('[Operator API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch operator ecosystem' }, { status: 500 });
  }
}
