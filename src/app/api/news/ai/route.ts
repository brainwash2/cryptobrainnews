import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export const dynamic = 'force-dynamic';

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!groqKey) return NextResponse.json([]);

  const groq = createGroq({ apiKey: groqKey });

  try {
    // 1. Fetch Cointelegraph RSS
    const rssRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss', { next: { revalidate: 300 } });
    const rssData = await rssRes.json();
    
    if (rssData.status !== 'ok' || !rssData.items) return NextResponse.json([]);
    
    const rawArticles = rssData.items.slice(0, 4);

    // 2. Generate AI Summaries
    const enriched = await Promise.all(
      rawArticles.map(async (article: any) => {
        try {
          const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            prompt: `Task: Summarize this crypto headline into 3 highly institutional bullets (max 8 words each). End with SENTIMENT: [Positive/Negative/Neutral].\nHeadline: "${article.title}"\nContext: "${article.description.replace(/<[^>]+>/g, '')}"`,
          });

          const [bulletsRaw = '', sentimentRaw = 'Neutral'] = text.split('SENTIMENT:');
          const bullets = bulletsRaw
            .trim()
            .split('\n')
            .map((l) => l.replace(/^[•\-\d.]+\s*/, '').trim())
            .filter((l) => l.length > 2)
            .slice(0, 3);

          return {
            id: article.guid || article.link,
            title: article.title,
            url: article.link,
            source: 'Cointelegraph',
            bullets,
            sentiment: sentimentRaw.trim().replace(/[.\s]/g, ''),
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json(enriched.filter(Boolean));
  } catch (err) {
    console.error('[AI News Error]', err);
    return NextResponse.json([]);
  }
}
