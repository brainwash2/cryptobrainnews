import 'server-only';
import { cached } from './cache';
import { getSupabase } from './supabase';
import { fetchCryptoNews } from './news';
import type { WeightedArticle } from './types';

export const SOURCE_WEIGHTS = {
  editorial: 100,
  alpha: 90,
  ai_summary: 70,
  wire: 30,
} as const;

async function fetchEditorialNews(): Promise<WeightedArticle[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    if (error || !data) return[];

    return data.map((a: any): WeightedArticle => {
      const isAlpha = a.category === 'Alpha Call';
      return {
        id: a.id,
        title: a.title,
        body: a.content || a.body || '',
        image: a.image_url || '',
        source: a.author || a.source || 'CryptoBrain',
        published_on: Math.floor(new Date(a.created_at || a.published_at).getTime() / 1000),
        url: `/news/${a.id}`,
        categories: [a.category || 'News'],
        tags: a.tags ||[],
        weight: isAlpha ? SOURCE_WEIGHTS.alpha : SOURCE_WEIGHTS.editorial,
        sourceType: isAlpha ? 'alpha' : 'editorial',
        author_name: a.author_name || a.author,
        author_bio: a.author_bio,
      };
    });
  } catch {
    return[];
  }
}

export async function getAllArticles(): Promise<WeightedArticle[]> {
  return cached(
    'articles:weighted:v3',
    async () => {
      const [editorial, wire] = await Promise.all([
        fetchEditorialNews(),
        fetchCryptoNews(30),
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
