import { NextResponse } from 'next/server';

const ALBY_API_URL = 'https://api.getalby.com/invoices';
const COST_SATS = 10;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const albyKey = process.env.ALBY_API_KEY;

    // Helper: Generate Mock Invoice (Fallback if no API key is provided)
    const getMockInvoice = () => {
      const mockHash = 'mock_hash_' + Date.now();
      const macaroon = Buffer.from(JSON.stringify({ payment_hash: mockHash })).toString('base64');
      const invoice = 'lnbc10n1p' + Math.random().toString(36).substring(2, 15) + 'mockinvoice';
      return { macaroon, invoice };
    };

    // 1. L402 Protocol Check: Is an authorization header present?
    if (!authHeader || !authHeader.startsWith('L402 ')) {
      let macaroon, invoice;

      if (albyKey) {
        // Fetch Real Lightning Invoice from Alby
        const res = await fetch(ALBY_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${albyKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: COST_SATS,
            description: 'CryptoBrain Agent Compute'
          })
        });

        if (!res.ok) throw new Error('Failed to generate Lightning invoice');
        
        const data = await res.json();
        invoice = data.payment_request;
        // In a strict L402 setup, the macaroon embeds the caveat and the payment hash
        macaroon = Buffer.from(JSON.stringify({ payment_hash: data.payment_hash })).toString('base64');
      } else {
        // Graceful Fallback
        const mock = getMockInvoice();
        macaroon = mock.macaroon;
        invoice = mock.invoice;
        console.warn('[L402] ALBY_API_KEY missing. Issuing mock invoice.');
      }

      // Respond with HTTP 402 Payment Required
      return NextResponse.json(
        { 
          error: 'Payment Required',
          message: `This execution endpoint requires a micro-transaction of ${COST_SATS} sats. Pay the attached invoice and return the macaroon and preimage as an L402 Bearer token (Format: L402 <macaroon>:<preimage>).`,
          cost_sats: COST_SATS,
          protocol: 'L402'
        },
        {
          status: 402,
          headers: {
            'WWW-Authenticate': `L402 macaroon="${macaroon}", invoice="${invoice}"`
          }
        }
      );
    }

    // 2. Validate Payment
    // Standard format: L402 <base64_macaroon>:<hex_preimage>
    const tokenParts = authHeader.replace('L402 ', '').split(':');
    const incomingMacaroon = tokenParts[0];
    // Preimage is required in a strict real-world implementation, but for this step we will verify state via API
    
    let isSettled = false;
    let paymentHash = '';

    try {
      const decodedMacaroon = JSON.parse(Buffer.from(incomingMacaroon, 'base64').toString('utf-8'));
      paymentHash = decodedMacaroon.payment_hash;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Macaroon format' }, { status: 401 });
    }

    if (albyKey && paymentHash && !paymentHash.startsWith('mock_hash')) {
      // Verify with Alby API
      const res = await fetch(`${ALBY_API_URL}/${paymentHash}`, {
        headers: { 'Authorization': `Bearer ${albyKey}` }
      });
      const data = await res.json();
      isSettled = data.settled === true;
    } else {
      // Accept mock tokens for testing
      isSettled = true;
    }

    if (!isSettled) {
      return NextResponse.json({ error: 'Invoice not settled' }, { status: 402 });
    }

    // 3. Execution Phase
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'execute_arbitrage_swap';
    const targetProtocol = body.target_protocol || 'unknown';

    // Simulate on-chain execution delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate mock transaction hash
    const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

    return NextResponse.json({
      status: 'success',
      execution_id: `cbn_exec_${Date.now()}`,
      message: `Agent action '${action}' completed on ${targetProtocol}.`,
      on_chain_data: {
        tx_hash: txHash,
        gas_used_usd: 0.12,
        network: body.network || 'arbitrum',
      },
      payment_status: 'settled',
    });

  } catch (error) {
    console.error('[API Execute] Error:', error);
    return NextResponse.json({ error: 'Internal execution failure' }, { status: 500 });
  }
}
