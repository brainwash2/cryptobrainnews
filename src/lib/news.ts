import { cached } from './cache';
import type { WeightedArticle } from './types';

const NEWS_API_URL = 'https://cryptocurrency.cv/api/news';

export async function fetchCryptoNews(limit = 20): Promise<WeightedArticle[]> {
  return cached('news:crypto-cv', async () => {
    try {
      const res = await fetch(NEWS_API_URL, { next: { revalidate: 300 } });
      if (!res.ok) throw new Error('News API failed');
      const data = await res.json();
      
      return (data ||[]).slice(0, limit).map((article: any, index: number) => ({
        id: article.id || `news-${index}`,
        title: article.title,
        body: article.body || article.summary || '',
        image: article.image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200',
        source: article.source || 'Crypto Wire',
        published_on: Math.floor(new Date(article.published_at || Date.now()).getTime() / 1000),
        url: article.url || '#',
        categories: article.categories || ['Market'],
        tags:[],
        weight: 50,
        sourceType: 'wire',
      }));
    } catch (error) {
      console.error('[News API] Error:', error);
      return[];
    }
  }, 300);
}
