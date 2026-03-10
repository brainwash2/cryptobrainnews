import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { hashApiKey, generateApiKey } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (await checkRateLimit(`kya:${ip}`, 3, 3600_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    const body = await request.json();
    const { agentName, pubkey, webhook } = body;
    
    if (!agentName || !pubkey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const apiKey = generateApiKey();
    const hashedKey = await hashApiKey(apiKey);
    
    await sql`
      INSERT INTO agent_identities (agent_name, pubkey, api_key, webhook_url)
      VALUES (${agentName}, ${pubkey}, ${hashedKey}, ${webhook || null})
    `;
    
    return NextResponse.json({ success: true, apiKey });
  } catch (err: any) {
    console.error('[KYA Registry] Error:', err.message);
    if (err.message.includes('unique constraint')) {
      return NextResponse.json({ error: 'Pubkey already registered' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
