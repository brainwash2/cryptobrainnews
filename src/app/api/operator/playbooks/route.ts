import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { SiweMessage } from 'siwe';

export const runtime = 'edge';

async function verifyAuth(request: Request) {
  const { searchParams } = new URL(request.url);
  const pubkey = searchParams.get('pubkey');
  const signature = request.headers.get('x-siwe-signature');
  const messageStr = request.headers.get('x-siwe-message');

  if (!pubkey || !signature || !messageStr) {
    throw new Error('Missing authentication headers or pubkey');
  }

  const siweMessage = new SiweMessage(messageStr);
  const { data } = await siweMessage.verify({ signature });
  
  if (data.address.toLowerCase() !== pubkey.toLowerCase()) {
    throw new Error('Signature address mismatch');
  }

  return pubkey;
}

export async function GET(request: Request) {
  try {
    const pubkey = await verifyAuth(request);
    
    const playbooks = await sql`
      SELECT id, name, description, schema_json, created_at
      FROM playbooks 
      WHERE lower(operator_pubkey) = lower(${pubkey})
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ playbooks });
  } catch (error: any) {
    console.error('[Playbooks API] GET Error:', error.message);
    return NextResponse.json({ error: 'Unauthorized or Internal Error' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const pubkey = await verifyAuth(request);
    const body = await request.json();
    const { name, description, schema_json } = body;

    if (!name || !schema_json) {
      return NextResponse.json({ error: 'Missing playbook data' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO playbooks (operator_pubkey, name, description, schema_json)
      VALUES (${pubkey}, ${name}, ${description || ''}, ${schema_json})
      RETURNING id, name, created_at
    `;

    return NextResponse.json({ success: true, playbook: result[0] });
  } catch (error: any) {
    console.error('[Playbooks API] POST Error:', error.message);
    return NextResponse.json({ error: 'Failed to save playbook' }, { status: 500 });
  }
}
