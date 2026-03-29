import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
import { getAllTags } from '@/lib/sanity';
 
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com').replace(/\/$/, '');
 
export const revalidate = 3600;
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, tags] = await Promise.all([
    getAllArticles().catch(() => []),
    getAllTags().catch(() => []),
  ]);
 
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,              lastModified: new Date(), changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${BASE}/news`,          lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/news/search`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE}/tags`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/authors`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/events`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/airdrops`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/price-indexes`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${BASE}/bookmarks`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
 
  const categoryRoutes: MetadataRoute.Sitemap = NEWS_CATEGORIES.map(cat => ({
    url: `${BASE}/news/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.85,
  }));
 
  const tagRoutes: MetadataRoute.Sitemap = (tags as string[]).map(tag => ({
    url: `${BASE}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.65,
  }));
 
  const editorialArticles = articles.filter(
    a => a.sourceType === 'editorial' || a.sourceType === 'alpha'
  );
  const articleRoutes: MetadataRoute.Sitemap = editorialArticles.map(article => ({
    url: `${BASE}/news/${article.id}`,
    lastModified: new Date(article.published_on * 1000),
    changeFrequency: 'weekly' as const,
    priority: article.sourceType === 'alpha' ? 0.8 : 0.75,
  }));
 
  return [...staticRoutes, ...categoryRoutes, ...tagRoutes, ...articleRoutes];
}
