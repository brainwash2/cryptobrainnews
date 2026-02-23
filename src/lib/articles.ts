import 'server-only';
import { cached } from './cache';
import { getSupabase } from './supabase';
import type { NewsArticle, WeightedArticle } from './types';

export const SOURCE_WEIGHTS = {
  editorial: 100,
  alpha: 90,
  ai_summary: 70,
  wire: 30,
} as const;

// 🚀 NEW: Cointelegraph RSS Fetcher
async function fetchWireNews(): Promise<WeightedArticle[]> {
  try {
    const rssUrl = 'https://cointelegraph.com/rss';
    // Use rss2json to safely parse XML to JSON without heavy NPM packages
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`, { 
      next: { revalidate: 300 } 
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !data.items) return [];

    return data.items.slice(0, 30).map((a: any): WeightedArticle => {
      // Strip HTML tags from description
      const cleanBody = (a.description || '').replace(/<[^>]+>/g, '').trim();
      
      return {
        id: a.guid || a.link,
        title: a.title,
        body: cleanBody,
        image: a.thumbnail || a.enclosure?.link || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200',
        source: 'Cointelegraph',
        published_on: Math.floor(new Date(a.pubDate).getTime() / 1000),
        url: a.link,
        categories: a.categories?.length ? a.categories : ['Market'],
        tags: [],
        weight: SOURCE_WEIGHTS.wire,
        sourceType: 'wire',
      };
    });
  } catch (err) {
    console.error('[RSS] Fetch failed:', err);
    return [];
  }
}

async function fetchEditorialNews(): Promise<WeightedArticle[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((a: any): WeightedArticle => {
      const isAlpha = a.category === 'Alpha Call';
      return {
        id: a.id,
        title: a.title,
        body: a.body || '',
        image: a.image_url || '',
        source: a.source || 'CryptoBrain',
        published_on: Math.floor(new Date(a.created_at || a.published_at).getTime() / 1000),
        url: `/news/${a.id}`,
        categories: [a.category || 'News'],
        tags: a.tags || [],
        weight: isAlpha ? SOURCE_WEIGHTS.alpha : SOURCE_WEIGHTS.editorial,
        sourceType: isAlpha ? 'alpha' : 'editorial',
        author_name: a.author_name,
        author_bio: a.author_bio,
      };
    });
  } catch {
    return [];
  }
}

export async function getAllArticles(): Promise<WeightedArticle[]> {
  return cached(
    'articles:weighted:v2',
    async () => {
      const [editorial, wire] = await Promise.all([
        fetchEditorialNews(),
        fetchWireNews(),
      ]);

      const all = [...editorial, ...wire];
      all.sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return b.published_on - a.published_on;
      });

      return all;
    },
    60
  );
}

export async function getArticleById(id: string): Promise<WeightedArticle | null> {
  const articles = await getAllArticles();
  return articles.find((a) => a.id === id) || null;
}

export async function getRelatedArticles(id: string, limit = 4): Promise<WeightedArticle[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.id !== id).slice(0, limit);
}

export async function getIntelligence(category: string): Promise<WeightedArticle[]> {
  const editorial = await fetchEditorialNews();
  return editorial.filter((a) => a.categories.includes(category));
}

export function calculateReadingTime(text: string): number {
  const words = (text || '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
