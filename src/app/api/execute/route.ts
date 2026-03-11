import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { hashApiKey } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

const ALBY_API_URL = 'https://api.getalby.com/invoices';
const COST_SATS = 10;

export async function POST(request: Request) {
  try {
    // 1. Apply Global Rate Limits (100 reqs per minute per IP)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (await checkRateLimit(`execute:${ip}`, 100, 60_000)) {
      return NextResponse.json({ error: 'Too many execution requests' }, { status: 429 });
    }

    // 2. Identify the Agent (x-api-key)
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing x-api-key header for identity tracking.' }, { status: 401 });
    }

    const hashedKey = await hashApiKey(apiKey);
    
    // --- TELEMETRY ADDED ---
    // Monitor this in Vercel Logs to ensure it matches the database hash
    console.log('[Auth Debug] Incoming Plain Key:', apiKey.substring(0, 15) + '...');
    console.log('[Auth Debug] Derived SHA-256 Hash:', hashedKey);
    
    // Admin query to find agent (Authentication Phase)
    const agents = await sql`SELECT id FROM agent_identities WHERE api_key = ${hashedKey} LIMIT 1`;
    if (agents.length === 0) {
      console.warn('[Auth Debug] Hash not found in agent_identities table.');
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }
    const agentId = agents[0].id;

    // 3. L402 Payment Verification
    const authHeader = request.headers.get('authorization');
    const albyKey = process.env.ALBY_API_KEY;

    if (!authHeader || !authHeader.startsWith('L402 ')) {
      let macaroon, invoice;
      if (albyKey) {
        const res = await fetch(ALBY_API_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${albyKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: COST_SATS, description: 'CryptoBrain Agent Compute' })
        });
        if (!res.ok) throw new Error('Failed to generate Lightning invoice');
        const data = await res.json();
        invoice = data.payment_request;
        macaroon = Buffer.from(JSON.stringify({ payment_hash: data.payment_hash })).toString('base64');
      } else {
        const mockHash = 'mock_hash_' + Date.now();
        macaroon = Buffer.from(JSON.stringify({ payment_hash: mockHash })).toString('base64');
        invoice = 'lnbc10n1p' + Math.random().toString(36).substring(2, 15) + 'mock';
      }
      return NextResponse.json(
        { error: 'Payment Required', cost_sats: COST_SATS, protocol: 'L402' },
        { status: 402, headers: { 'WWW-Authenticate': `L402 macaroon="${macaroon}", invoice="${invoice}"` } }
      );
    }

    const incomingMacaroon = authHeader.replace('L402 ', '').split(':')[0];
    let isSettled = false;
    let paymentHash = '';

    try {
      paymentHash = JSON.parse(Buffer.from(incomingMacaroon, 'base64').toString('utf-8')).payment_hash;
    } catch {
      return NextResponse.json({ error: 'Invalid Macaroon' }, { status: 401 });
    }

    if (albyKey && paymentHash && !paymentHash.startsWith('mock_hash')) {
      const res = await fetch(`${ALBY_API_URL}/${paymentHash}`, { headers: { 'Authorization': `Bearer ${albyKey}` } });
      const data = await res.json();
      isSettled = data.settled === true;
    } else {
      isSettled = true; // Accept mocks locally
    }

    if (!isSettled) return NextResponse.json({ error: 'Invoice not settled' }, { status: 402 });

    // 4. Execution & RLS Logging
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'execute_arbitrage_swap';
    const targetProtocol = body.target_protocol || 'unknown';
    
    // Neon Serverless HTTP Batch Transaction
    await sql.transaction([
      sql`SET LOCAL "agent.current_id" = ${agentId}`,
      sql`
        INSERT INTO execution_logs (agent_id, action, target_protocol, cost_sats, payment_hash, status, execution_time_ms)
        VALUES (${agentId}, ${action}, ${targetProtocol}, ${COST_SATS}, ${paymentHash}, 'settled', 800)
      `
    ]);

    return NextResponse.json({
      status: 'success',
      message: `Agent action '${action}' completed.`,
      payment_status: 'settled',
    });

  } catch (error) {
    console.error('[API Execute] Error:', error);
    return NextResponse.json({ error: 'Internal execution failure' }, { status: 500 });
  }
}
