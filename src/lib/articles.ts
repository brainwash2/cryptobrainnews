import 'server-only';
import { cached } from './cache';
import { fetchCryptoNews, fetchNewsByCategory } from './news';
import { getSanityPosts, getSanityPostsByCategory } from './sanity';
import type { WeightedArticle } from './types';

export { articleHref } from './article-utils';

export const SOURCE_WEIGHTS = {
  editorial: 100,
  alpha: 90,
  ai_summary: 70,
  wire: 30,
} as const;

function sanityToWeighted(post: any): WeightedArticle {
  const isAlpha = post.category === 'Alpha Call';
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
    body: bodyText || post.excerpt || post.title,
    image: post.imageUrl || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200',
    source: 'CryptoBrain',
    published_on: Math.floor(new Date(post.publishedAt || Date.now()).getTime() / 1000),
    url: `/news/${post.slug || post._id}`,
    categories: [post.category || 'News'],
    tags: [],
    weight: isAlpha ? SOURCE_WEIGHTS.alpha : SOURCE_WEIGHTS.editorial,
    sourceType: isAlpha ? 'alpha' : 'editorial',
    author_name: 'CryptoBrain Editorial',
  };
}

async function fetchSanityEditorial(): Promise<WeightedArticle[]> {
  try {
    const posts = await getSanityPosts();
    return posts.map(sanityToWeighted);
  } catch (err) {
    console.error('[Sanity API] Error fetching posts:', err);
    return [];
  }
}

export async function getAllArticles(): Promise<WeightedArticle[]> {
  return cached(
    'articles:weighted:v6',
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

export async function getArticlesByCategory(category: string): Promise<WeightedArticle[]> {
  return cached(`articles:category:${category}`, async () => {
    const [sanityPosts, wireArticles] = await Promise.all([
      getSanityPostsByCategory(category).catch(() => []),
      fetchNewsByCategory(category, 30),
    ]);
    const editorial = (sanityPosts as any[]).map(sanityToWeighted);
    const all = [...editorial, ...wireArticles];
    all.sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.published_on - a.published_on;
    });
    return all;
  }, 60);
}

export async function getArticleById(id: string): Promise<WeightedArticle | null> {
  const articles = await getAllArticles();
  return articles.find((a) => a.id === id) || null;
}

export async function getRelatedArticles(id: string, limit = 4): Promise<WeightedArticle[]> {
  const all = await getAllArticles();
  const current = all.find(a => a.id === id);
  const others = all.filter((a) => a.id !== id);
  if (!current) return others.slice(0, limit);
  const sameCategory = others.filter(a =>
    a.categories.some(c => current.categories.includes(c))
  );
  const rest = others.filter(a =>
    !a.categories.some(c => current.categories.includes(c))
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getIntelligence(category: string): Promise<WeightedArticle[]> {
  const editorial = await fetchSanityEditorial();
  return editorial.filter((a) => a.categories.includes(category));
}

export async function getSearchIndex() {
  const all = await getAllArticles();
  return all.map(({ id, title, source, categories, body, url, image, published_on, weight, sourceType, tags }) => ({
    id, title, source, categories,
    body: body.slice(0, 300),
    url, image, published_on, weight, sourceType, tags,
  }));
}

export function calculateReadingTime(text: string): number {
  const words = (text || '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
