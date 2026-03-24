import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export const revalidate = 300;
export const maxDuration = 60;

const FEED_URLS: Record<string, string> = {
  market:     'https://cointelegraph.com/rss',
  bitcoin:    'https://bitcoinmagazine.com/.rss/full/',
  ethereum:   'https://cointelegraph.com/rss/tag/ethereum',
  defi:       'https://thedefiant.io/feed',
  default:    'https://cointelegraph.com/rss',
};

interface RssItem {
  guid?: string;
  link: string;
  title: string;
  description: string;
}

function parseItems(xml: string, limit = 5): RssItem[] {
  const items: RssItem[] = [];
  const matches = [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)];
  for (const [, itemXml] of matches.slice(0, limit)) {
    const get = (tag: string) => {
      const m = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
        || itemXml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };
    const link = get('link') || get('guid');
    const title = get('title');
    if (!title || !link) continue;
    items.push({ guid: get('guid'), link, title, description: get('description') });
  }
  return items;
}

async function processArticle(article: RssItem, groqModel: any, hasKey: boolean) {
  const cleanContext = article.description.replace(/<[^>]+>/g, '').slice(0, 500);

  if (!hasKey) {
    return {
      id: article.guid || article.link,
      title: article.title,
      url: article.link,
      bullets: [cleanContext + '…'],
      sentiment: 'Neutral',
    };
  }

  try {
    const { text } = await generateText({
      model: groqModel,
      prompt: `Summarise this crypto headline into 3 institutional bullets (max 8 words each). End with SENTIMENT: [Positive/Negative/Neutral].\nHeadline: "${article.title}"\nContext: "${cleanContext}"`,
      maxRetries: 1,
      timeout: 10000,
    });

    const [bulletsRaw = '', sentimentRaw = 'Neutral'] = text.split('SENTIMENT:');
    const bullets = bulletsRaw.trim().split('\n')
      .map(l => l.replace(/^[•\-\d.]+\s*/, '').trim())
      .filter(l => l.length > 2)
      .slice(0, 3);

    return {
      id: article.guid || article.link,
      title: article.title,
      url: article.link,
      bullets: bullets.length > 0 ? bullets : ['Market data updating…'],
      sentiment: sentimentRaw.trim().replace(/[.\s]/g, '') || 'Neutral',
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || 'default';
  const feedUrl = FEED_URLS[category] || FEED_URLS.default;

  const groqKey = process.env.GROQ_API_KEY?.trim();
  const hasKey = !!groqKey;
  const groq = hasKey ? createGroq({ apiKey: groqKey }) : null;
  const model = hasKey ? groq!('llama-3.3-70b-versatile') : null;

  try {
    const rssRes = await fetch(feedUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!rssRes.ok) throw new Error('RSS fetch failed');
    const xml = await rssRes.text();
    const rawArticles = parseItems(xml, 5);

    const enriched = await Promise.all(
      rawArticles.map(a => processArticle(a, model, hasKey))
    );

    return NextResponse.json(enriched.filter(Boolean));
  } catch {
    return NextResponse.json([]);
  }
}
