import { NextResponse } from 'next/server';
import { getDeFiProtocols } from '@/lib/api';
import { client } from '@/lib/sanity';
import { createClient } from 'next-sanity';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '9z1iv2c9',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-04',
  useCdn: false, // Must be false for database writes
  token: process.env.SANITY_API_WRITE_TOKEN,
});

export async function POST(request: Request) {
  try {
    // 1. Fetch existing guides from Sanity to prevent duplicates
    const existingSlugs = await client.fetch(`*[_type == "airdropGuide"].slug.current`);
    const existingSet = new Set(existingSlugs ||[]);

    // 2. Fetch protocol data and filter for high-value tokenless targets
    const protocols = await getDeFiProtocols();
    const candidates = protocols.filter(p => 
      (!p.symbol || p.symbol === '-' || p.symbol.toLowerCase() === 'none') && 
      (p.tvl || 0) > 5000000 &&
      p.category !== 'CEX' &&
      p.category !== 'Chain' &&
      p.category !== 'Bridge'
    ).sort((a, b) => (b.tvl || 0) - (a.tvl || 0));

    // 3. Find the first candidate that doesn't have a guide yet
    const target = candidates.find(p => {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return !existingSet.has(slug);
    });

    if (!target) {
      return NextResponse.json({ message: 'No new tokenless protocols found above $5M TVL.' }, { status: 404 });
    }

    const slug = target.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // 4. Synthesize Playbook via Groq LLM
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (!groqKey) throw new Error("GROQ_API_KEY environment variable is missing");
    
    const groq = createGroq({ apiKey: groqKey });
    const prompt = `You are a quantitative Web3 analyst. Generate a highly actionable airdrop farming playbook for a protocol named "${target.name}". 
    It is a ${target.category || 'DeFi'} protocol on ${target.chain || 'multiple chains'} with $${((target.tvl || 0) / 1e6).toFixed(1)}M Total Value Locked.
    Return ONLY a raw JSON object matching this exact schema:
    {
      "probability": "High", // Must be exactly "High", "Medium", or "Speculative" based on TVL > $100M (High), > $20M (Medium).
      "steps":[
        { "title": "Step 1 Action (e.g., Bridge Liquidity)", "description": "Specific institutional-grade instructions" },
        { "title": "Step 2 Action", "description": "Specific instructions" },
        { "title": "Step 3 Action", "description": "Specific instructions" }
      ]
    }
    Do not include markdown tags like \`\`\`json. Output raw JSON only.`;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
    });

    // 5. Parse and map to Sanity Schema
    const rawJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const generated = JSON.parse(rawJson);

    const doc = {
      _type: 'airdropGuide',
      title: target.name,
      slug: { _type: 'slug', current: slug },
      chain: target.chain || 'Multi',
      probability: generated.probability || 'Medium',
      isFeatured: false,
      steps: generated.steps.map((s: any) => ({
        title: s.title,
        description: s.description
      }))
    };

    // 6. Execute DB Write
    if (process.env.SANITY_API_WRITE_TOKEN) {
      await writeClient.create(doc);
    } else {
      console.warn("[Sanity] SANITY_API_WRITE_TOKEN missing. Generated payload locally but skipped DB insertion.");
    }

    return NextResponse.json({ 
      success: true, 
      protocol: target.name,
      slug 
    });

  } catch (error: any) {
    console.error('[Generate Airdrop] AI Orchestration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
