import 'server-only';
import { cached } from './cache';
import { getSupabase } from './supabase';
import type { NewsArticle } from './types';

const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

async function fetchCryptoCompareNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(NEWS_API, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.Data) return [];

    return data.Data.slice(0, 40).map((a: any) => ({
      id: String(a.id),
      title: a.title,
      body: a.body || '',
      image: a.imageurl,
      source: a.source_info?.name || 'News Wire',
      published_on: a.published_on,
      url: a.url,
      categories: a.categories?.split('|') || ['General'],
      tags: a.tags?.split('|') || [],
    }));
  } catch { return []; }
}

async function fetchSupabaseNews(): Promise<NewsArticle[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error || !data) return [];

    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      body: a.body || '',
      image: a.image_url || '',
      source: 'CryptoBrain',
      published_on: Math.floor(new Date(a.published_at).getTime() / 1000), 
      url: `/news/${a.id}`,
      categories: [a.category],
      tags: a.tags || [],
      author_name: a.author_name,
      author_bio: a.author_bio
    }));
  } catch { return []; }
}

export async function getAllArticles(): Promise<NewsArticle[]> {
  return cached('articles:merged', async () => {
    const [external, internal] = await Promise.all([
      fetchCryptoCompareNews(),
      fetchSupabaseNews(),
    ]);
    return [...internal, ...external].sort((a, b) => b.published_on - a.published_on);
  }, 60);
}

export async function getArticleById(id: string) {
  const articles = await getAllArticles();
  return articles.find(a => a.id === id) || null;
}

export async function getRelatedArticles(id: string, limit = 4) {
  const all = await getAllArticles();
  return all.filter(a => a.id !== id).slice(0, limit);
}

export async function getIntelligence(category: string) {
  const all = await fetchSupabaseNews();
  return all.filter(a => a.categories.includes(category));
}
