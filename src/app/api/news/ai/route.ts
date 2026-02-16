import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!groqKey) return NextResponse.json([]);

  const groq = createGroq({ apiKey: groqKey });

  try {
    // 1. Switch to CryptoCompare (Verified working source)
    const newsRes = await fetch(
      'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
      { next: { revalidate: 600 } }
    );
    
    if (!newsRes.ok) return NextResponse.json([]);

    const newsData = await newsRes.json();
    const rawArticles = newsData.Data?.slice(0, 4) || [];

    // 2. AI Summarization
    const enriched = await Promise.all(
      rawArticles.map(async (article: any) => {
        try {
          const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            prompt: `Task: Summarize this headline into 3 bullets (6 words max each). End with SENTIMENT: [Positive/Negative/Neutral].
            Headline: "${article.title}"`,
          });

          const [bulletsRaw, sentimentRaw] = text.split('SENTIMENT:');
          const bullets = bulletsRaw.trim().split('\n')
            .map(l => l.replace(/^[•\-\d\.]+\s*/, '').trim())
            .filter(l => l.length > 2)
            .slice(0, 3);

          return {
            id: String(article.id),
            title: article.title,
            url: article.url,
            source: article.source_info?.name || 'Wire',
            bullets,
            sentiment: (sentimentRaw || 'Neutral').trim().replace(/[.\s]/g, ''),
          };
        } catch { return null; }
      })
    );

    return NextResponse.json(enriched.filter(Boolean));
  } catch (error) {
    return NextResponse.json([]);
  }
}
