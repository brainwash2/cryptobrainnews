import 'server-only';
import { cached } from './cache';
import type { WeightedArticle } from './types';

// Re-export from the client-safe constants file so server code can use them too
export { NEWS_CATEGORIES } from './news-categories';
export type { CategorySlug } from './news-categories';

// ---------------------------------------------------------------------------
// Feed registry
// ---------------------------------------------------------------------------
export interface FeedConfig {
  url: string;
  source: string;
  categories: string[];
  weight?: number;
}

export const CATEGORY_FEEDS: Record<string, FeedConfig[]> = {
  market: [
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', categories: ['market'] },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', categories: ['market'] },
    { url: 'https://cryptoslate.com/feed/', source: 'CryptoSlate', categories: ['market'] },
  ],
  bitcoin: [
    { url: 'https://bitcoinmagazine.com/.rss/full/', source: 'Bitcoin Magazine', categories: ['bitcoin'] },
    { url: 'https://cointelegraph.com/rss/tag/bitcoin', source: 'Cointelegraph', categories: ['bitcoin'] },
  ],
  ethereum: [
    { url: 'https://decrypt.co/category/ethereum/feed', source: 'Decrypt', categories: ['ethereum'] },
    { url: 'https://cointelegraph.com/rss/tag/ethereum', source: 'Cointelegraph', categories: ['ethereum'] },
  ],
  defi: [
    { url: 'https://thedefiant.io/feed', source: 'The Defiant', categories: ['defi'] },
    { url: 'https://blockworks.co/feed', source: 'Blockworks', categories: ['defi'] },
  ],
  nft: [
    { url: 'https://decrypt.co/category/nft/feed', source: 'Decrypt', categories: ['nft'] },
    { url: 'https://cointelegraph.com/rss/tag/nfts', source: 'Cointelegraph', categories: ['nft'] },
  ],
  regulation: [
    { url: 'https://cointelegraph.com/rss/tag/regulation', source: 'Cointelegraph', categories: ['regulation'] },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/category/policy-regulation/', source: 'CoinDesk', categories: ['regulation'] },
  ],
  research: [
    { url: 'https://www.theblock.co/rss.xml', source: 'The Block', categories: ['research'] },
    { url: 'https://blockworks.co/feed', source: 'Blockworks', categories: ['research'] },
  ],
  layer2: [
    { url: 'https://blockworks.co/feed', source: 'Blockworks', categories: ['layer2'] },
    { url: 'https://decrypt.co/feed', source: 'Decrypt', categories: ['layer2'] },
  ],
};

const ALL_DEFAULT_FEEDS: FeedConfig[] = [
  { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', categories: ['market'] },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', categories: ['market'] },
  { url: 'https://www.theblock.co/rss.xml', source: 'The Block', categories: ['research'] },
  { url: 'https://decrypt.co/feed', source: 'Decrypt', categories: ['market'] },
  { url: 'https://blockworks.co/feed', source: 'Blockworks', categories: ['defi'] },
];

// ---------------------------------------------------------------------------
// XML parser
// ---------------------------------------------------------------------------
function parseRssXml(xml: string, source: string, categories: string[]): WeightedArticle[] {
  const items: WeightedArticle[] = [];
  const itemMatches = [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)];

  for (const [, itemXml] of itemMatches) {
    const get = (tag: string) => {
      const m = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
        || itemXml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };

    const title = get('title');
    const link = get('link') || get('guid');
    const pubDate = get('pubDate');
    const description = get('description').replace(/<[^>]+>/g, '').slice(0, 220);
    const guid = get('guid') || link;

    const imgMatch = itemXml.match(/url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
    const image = imgMatch
      ? imgMatch[1]
      : 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800';

    if (!title || !link) continue;

    items.push({
      id: guid,
      title,
      body: description + '…',
      image,
      source,
      published_on: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
      url: link,
      categories,
      tags: [],
      weight: 50,
      sourceType: 'wire',
    });
  }
  return items;
}

async function fetchFeed(feed: FeedConfig, limit: number): Promise<WeightedArticle[]> {
  try {
    const res = await fetch(feed.url, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'CryptoBrainNews/1.0 RSS Reader' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRssXml(xml, feed.source, feed.categories).slice(0, limit);
  } catch (err) {
    console.error(`[News] Failed to fetch ${feed.source}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API (server-only)
// ---------------------------------------------------------------------------

export async function fetchCryptoNews(limit = 20, topic?: string): Promise<WeightedArticle[]> {
  const cacheKey = topic ? `news:topic:${topic.toLowerCase()}` : 'news:multi-rss';

  return cached(cacheKey, async () => {
    if (topic) {
      const query = encodeURIComponent(`"${topic}" crypto`);
      const url = `https://news.google.com/rss/search?q=${query}+when:7d&hl=en-US&gl=US&ceid=US:en`;
      try {
        const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) });
        const xml = await res.text();
        return parseRssXml(xml, 'Google News', [topic.toUpperCase()])
          .slice(0, limit)
          .map(a => ({ ...a, weight: 80 }));
      } catch {
        return [];
      }
    }

    const results = await Promise.allSettled(
      ALL_DEFAULT_FEEDS.map(feed => fetchFeed(feed, limit))
    );
    const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
    return all.sort((a, b) => b.published_on - a.published_on).slice(0, limit);
  }, 300);
}

export async function fetchNewsByCategory(category: string, limit = 30): Promise<WeightedArticle[]> {
  const slug = category.toLowerCase();
  return cached(`news:category:${slug}`, async () => {
    const feeds = CATEGORY_FEEDS[slug] || CATEGORY_FEEDS.market;
    const results = await Promise.allSettled(feeds.map(f => fetchFeed(f, limit)));
    const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
    return all
      .map(a => ({ ...a, categories: [slug] }))
      .sort((a, b) => b.published_on - a.published_on)
      .slice(0, limit);
  }, 300);
}
