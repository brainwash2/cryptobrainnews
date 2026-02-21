import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

interface CryptoCompareArticle {
  id: number;
  title: string;
  url: string;
  source_info?: { name?: string };
  body?: string;
}

interface EnrichedArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  bullets: string[];
  sentiment: string;
}

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!groqKey) return NextResponse.json([]);

  const groq = createGroq({ apiKey: groqKey });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const newsRes = await fetch(
      'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
      { next: { revalidate: 600 }, signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!newsRes.ok) return NextResponse.json([]);

    const newsData = await newsRes.json();
    const rawArticles: CryptoCompareArticle[] = (newsData.Data ?? []).slice(0, 4);

    const enriched: (EnrichedArticle | null)[] = await Promise.all(
      rawArticles.map(async (article): Promise<EnrichedArticle | null> => {
        try {
          const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            prompt: `Task: Summarize this headline into 3 bullets (6 words max each). End with SENTIMENT: [Positive/Negative/Neutral].\nHeadline: "${article.title}"`,
          });

          const [bulletsRaw = '', sentimentRaw = 'Neutral'] = text.split('SENTIMENT:');
          const bullets = bulletsRaw
            .trim()
            .split('\n')
            .map((l) => l.replace(/^[•\-\d.]+\s*/, '').trim())
            .filter((l) => l.length > 2)
            .slice(0, 3);

          return {
            id: String(article.id),
            title: article.title,
            url: article.url,
            source: article.source_info?.name ?? 'Wire',
            bullets,
            sentiment: sentimentRaw.trim().replace(/[.\s]/g, ''),
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json(enriched.filter(Boolean));
  } catch {
    return NextResponse.json([]);
  }
}
