import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const scorerId = process.env.GITCOIN_SCORER_ID;
    const apiKey = process.env.GITCOIN_API_KEY;

    // Graceful fallback for local development / missing keys
    if (!scorerId || !apiKey) {
      console.warn('[Gitcoin] Missing API keys. Returning mock verification for testing.');
      return NextResponse.json({ 
        score: 25.5, 
        isHuman: true,
        message: 'Mock verification successful'
      });
    }

    const res = await fetch(`https://api.scorer.gitcoin.co/registry/score/${scorerId}/${address}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from Gitcoin API');
    }

    const data = await res.json();
    const score = Number(data.score || 0);
    const isHuman = score >= 20;

    return NextResponse.json({ score, isHuman });

  } catch (error) {
    console.error('[Gitcoin] Verification Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
