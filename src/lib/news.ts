import { cached } from './cache';
import type { WeightedArticle } from './types';

const DEFAULT_RSS_FEEDS =[
  { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' }
];

export async function fetchCryptoNews(limit = 20, topic?: string): Promise<WeightedArticle[]> {
  // Use a unique cache key if a topic is provided
  const cacheKey = topic ? `news:topic:${topic.toLowerCase()}` : 'news:multi-rss';
  
  return cached(cacheKey, async () => {
    try {
      const allArticles: WeightedArticle[] =[];
      
      let feedsToFetch = DEFAULT_RSS_FEEDS;

      if (topic) {
        // When a topic is provided (e.g., from /coins/pepe), we query Google News RSS
        // We use rss2json.com to bypass Google's strict server blocks
        const query = encodeURIComponent(`"${topic}" crypto`);
        feedsToFetch =[
          { 
            url: `https://news.google.com/rss/search?q=${query}+when:7d&hl=en-US&gl=US&ceid=US:en`, 
            source: 'Google News' 
          }
        ];
      }

      for (const feed of feedsToFetch) {
        try {
          // The rss2json API converts the raw XML into clean JSON for us
          const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&api_key=`;
          
          const res = await fetch(proxyUrl, { next: { revalidate: 300 } });
          const data = await res.json();
          
          if (data.status === 'ok' && Array.isArray(data.items)) {
            const parsed = data.items.slice(0, limit).map((item: any, idx: number) => ({
              id: item.guid || `${feed.source}-${idx}`,
              title: item.title,
              // Clean out HTML tags from the description
              body: (item.description || '').replace(/<[^>]+>/g, '').slice(0, 200) + '...',
              image: item.thumbnail || item.enclosure?.link || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200',
              // Try to extract the original publisher name if it came from Google News
              source: feed.source === 'Google News' && item.source?.title ? item.source.title : feed.source,
              published_on: Math.floor(new Date(item.pubDate).getTime() / 1000),
              url: item.link,
              categories: [topic ? topic.toUpperCase() : 'Market'],
              tags:[],
              weight: topic ? 80 : 50,
              sourceType: 'wire',
            }));
            allArticles.push(...parsed);
          }
        } catch (e) {
          console.error(`[News] Failed to fetch RSS for ${feed.source}`, e);
        }
      }

      // Sort by newest first
      return allArticles.sort((a, b) => b.published_on - a.published_on).slice(0, limit);
    } catch (error) {
      console.error('[News API] Aggregation Error:', error);
      return[];
    }
  }, 300); // Cache results for 5 minutes
}
