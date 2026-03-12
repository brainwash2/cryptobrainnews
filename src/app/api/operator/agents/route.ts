import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { SiweMessage } from 'siwe';

export const runtime = 'edge';

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
    
    // Ensure the signed message address matches the requested pubkey
    if (data.address.toLowerCase() !== pubkey.toLowerCase()) {
      return NextResponse.json({ error: 'Signature address mismatch' }, { status: 403 });
    }

    // 2. Fetch ecosystem safely
    const agents = await sql`
      SELECT id, agent_name, created_at
      FROM agent_identities 
      WHERE lower(pubkey) = lower(${pubkey})
      ORDER BY created_at DESC
    `;

    let stats = { total_execs: 0, total_sats: 0 };
    if (agents.length > 0) {
      const agentIds = agents.map(a => a.id);
      const results = await sql.transaction([
        sql`SELECT COUNT(*)::int as execs FROM execution_logs WHERE agent_id = ANY(${agentIds}) AND status = 'settled'`,
        sql`SELECT COALESCE(SUM(cost_sats), 0)::int as sats FROM execution_logs WHERE agent_id = ANY(${agentIds}) AND status = 'settled'`
      ]);
      stats.total_execs = results[0][0].execs;
      stats.total_sats = results[1][0].sats;
    }

    return NextResponse.json({ agents, stats });

  } catch (error) {
    console.error('[Operator API] Verification/Fetch Error:', error);
    return NextResponse.json({ error: 'Unauthorized or Internal Error' }, { status: 401 });
  }
}
