import 'server-only';
import { cached } from './cache';
import { fetchCryptoNews } from './news';
import { getSanityPosts } from './sanity';
import type { WeightedArticle } from './types';

export const SOURCE_WEIGHTS = {
  editorial: 100,
  alpha: 90,
  ai_summary: 70,
  wire: 30,
} as const;

async function fetchSanityEditorial(): Promise<WeightedArticle[]> {
  try {
    const posts = await getSanityPosts();
    return posts.map((post: any): WeightedArticle => {
      const isAlpha = post.category === 'Alpha Call';
      
      // Convert Sanity Portable Text to a plain string with double line breaks for the frontend
      let bodyText = '';
      if (Array.isArray(post.body)) {
        bodyText = post.body
          .filter((b: any) => b._type === 'block')
          .map((b: any) => b.children?.map((c: any) => c.text).join(''))
          .join('\n\n');
      }

      return {
        id: post.slug || post._id,
        title: post.title || 'Untitled',
        body: bodyText || post.title,
        image: post.imageUrl || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200',
        source: 'CryptoBrain',
        published_on: Math.floor(new Date(post.publishedAt || Date.now()).getTime() / 1000),
        url: `/news/${post.slug}`,
        categories:[post.category || 'News'],
        tags:[],
        weight: isAlpha ? SOURCE_WEIGHTS.alpha : SOURCE_WEIGHTS.editorial,
        sourceType: isAlpha ? 'alpha' : 'editorial',
        author_name: 'CryptoBrain Editorial',
      };
    });
  } catch (err) {
    console.error('[Sanity API] Error fetching posts:', err);
    return[];
  }
}

export async function getAllArticles(): Promise<WeightedArticle[]> {
  return cached(
    'articles:weighted:v5', // Bumped cache version
    async () => {
      const [editorial, wire] = await Promise.all([
        fetchSanityEditorial(),
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
  const editorial = await fetchSanityEditorial();
  return editorial.filter((a) => a.categories.includes(category));
}

export function calculateReadingTime(text: string): number {
  const words = (text || '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
