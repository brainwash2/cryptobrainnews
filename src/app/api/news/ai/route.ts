import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export const revalidate = 300;
export const maxDuration = 60;

interface RssItem {
  guid?: string;
  link: string;
  title: string;
  description: string;
}

async function processArticle(article: RssItem, groqModel: any, hasKey: boolean) {
  const cleanContext = article.description.replace(/<[^>]+>/g, '').slice(0, 500);
  
  // GRACEFUL FALLBACK: If no API key, return standard RSS text
  if (!hasKey) {
    return {
      id: article.guid || article.link,
      title: article.title,
      url: article.link,
      source: 'Cointelegraph',
      bullets: [cleanContext + '...'],
      sentiment: 'Neutral',
    };
  }

  try {
    const { text } = await generateText({
      model: groqModel,
      prompt: `Task: Summarize this crypto headline into 3 highly institutional bullets (max 8 words each). End with SENTIMENT: [Positive/Negative/Neutral].\nHeadline: "${article.title}"\nContext: "${cleanContext}"`,
      maxRetries: 1,
      timeout: 10000,
    });

    const [bulletsRaw = '', sentimentRaw = 'Neutral'] = text.split('SENTIMENT:');
    const bullets = bulletsRaw.trim().split('\n').map((l) => l.replace(/^[•\-\d.]+\s*/, '').trim()).filter((l) => l.length > 2).slice(0, 3);

    return {
      id: article.guid || article.link,
      title: article.title,
      url: article.link,
      source: 'Cointelegraph',
      bullets: bullets.length > 0 ? bullets : ['Market data updating...'],
      sentiment: sentimentRaw.trim().replace(/[.\s]/g, '') || 'Neutral',
    };
  } catch (err) {
    return null;
  }
}

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const hasKey = !!groqKey;
  const groq = hasKey ? createGroq({ apiKey: groqKey }) : null;
  const model = hasKey ? groq!('llama-3.3-70b-versatile') : null;

  try {
    const rssRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss', { next: { revalidate: 300 } });
    if (!rssRes.ok) throw new Error('RSS fetch failed');
    const rssData = await rssRes.json();
    if (rssData.status !== 'ok' || !rssData.items) return NextResponse.json([]);
    
    const rawArticles: RssItem[] = rssData.items.slice(0, 5);
    const enriched = await Promise.all(rawArticles.map((article) => processArticle(article, model, hasKey)));

    return NextResponse.json(enriched.filter(Boolean));
  } catch (err) {
    return NextResponse.json([]);
  }
}
