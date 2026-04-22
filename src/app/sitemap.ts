/**
 * app/sitemap.ts
 * Next.js 16 Metadata API sitemap — auto-submitted to Google Search Console.
 */

import { type MetadataRoute } from 'next';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
import { getAllTags } from '@/lib/sanity';
import { PageCache } from '../lib/news/page-cache';
import { sanityFetch } from '../lib/news/sanity-client';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://cryptobrainnews.com';
const cache = new PageCache();

interface ArticleMeta {
  slug:        string;
  publishedAt: string;
  updatedAt?:  string;
}

interface AuthorMeta {
  slug: string;
}

async function fetchArticleMetas(): Promise<ArticleMeta[]> {
  const { data } = await cache.getOrSet('sitemap', 'articles', () =>
    sanityFetch<ArticleMeta[]>(
      `*[_type == "post"] | order(publishedAt desc) {
         "slug":        slug.current,
         "publishedAt": publishedAt,
         "updatedAt":   _updatedAt
       }`,
    ),
  );
  return data;
}

async function fetchAuthors(): Promise<AuthorMeta[]> {
  const { data } = await cache.getOrSet('sitemap', 'authors', () =>
    sanityFetch<AuthorMeta[]>(
      `*[_type == "author" && defined(slug.current)] { "slug": slug.current }`,
    ),
  );
  return data;
}

function articlePriority(publishedAt: string): number {
  const ageMs  = Date.now() - new Date(publishedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 7)  return 0.9;
  if (ageDays < 30) return 0.8;
  return 0.6;
}

function articleChangefreq(
  publishedAt: string,
): MetadataRoute.Sitemap[number]['changeFrequency'] {
  const ageDays = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000;
  if (ageDays < 7)  return 'hourly';
  if (ageDays < 30) return 'daily';
  return 'weekly';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allTags, articleMetas, authors] = await Promise.all([
    getAllTags().catch(() => []),
    fetchArticleMetas(),
    fetchAuthors(),
  ]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,              lastModified: new Date(), changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${BASE_URL}/news`,          lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.95 },
    { url: `${BASE_URL}/news/search`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE_URL}/tags`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/authors`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/events`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/airdrops`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/price-indexes`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${BASE_URL}/bookmarks`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = NEWS_CATEGORIES.map(cat => ({
    url: `${BASE_URL}/news/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.85,
  }));

  // Tag routes
  const tagRoutes: MetadataRoute.Sitemap = (allTags as string[]).map(tag => ({
    url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.65,
  }));

  // Article routes
  const articleEntries: MetadataRoute.Sitemap = articleMetas.map((a) => ({
    url:            `${BASE_URL}/news/${a.slug}`,
    lastModified:   a.updatedAt ?? a.publishedAt,
    changeFrequency: articleChangefreq(a.publishedAt),
    priority:       articlePriority(a.publishedAt),
  }));

  // Author routes
  const authorEntries: MetadataRoute.Sitemap = authors.map((a) => ({
    url:            `${BASE_URL}/authors/${a.slug}`,
    changeFrequency: 'monthly',
    priority:       0.5,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...articleEntries,
    ...authorEntries,
  ];
}
