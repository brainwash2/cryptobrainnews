import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
 
// Strip trailing slash to prevent double-slash in URLs
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com').replace(/\/$/, '');
 
export const revalidate = 3600;
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles().catch(() => []);
 
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,              lastModified: new Date(), changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${BASE_URL}/news`,          lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE_URL}/news/search`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE_URL}/events`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/airdrops`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/price-indexes`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
  ];
 
  const categoryRoutes: MetadataRoute.Sitemap = NEWS_CATEGORIES.map(cat => ({
    url: `${BASE_URL}/news/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.85,
  }));
 
  const editorialArticles = articles.filter(
    a => a.sourceType === 'editorial' || a.sourceType === 'alpha'
  );
  const articleRoutes: MetadataRoute.Sitemap = editorialArticles.map(article => ({
    url: `${BASE_URL}/news/${article.id}`,
    lastModified: new Date(article.published_on * 1000),
    changeFrequency: 'weekly' as const,
    priority: article.sourceType === 'alpha' ? 0.8 : 0.75,
  }));
 
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
