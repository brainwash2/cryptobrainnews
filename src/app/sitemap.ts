// src/app/sitemap.ts
import 'server-only';
import { type MetadataRoute } from 'next';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
import { getAllTags } from '@/lib/sanity';
import { PageCache } from '../lib/news/page-cache';
import { sanityFetch } from '../lib/news/sanity-client';

export const revalidate = 3600;

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryptobrainnews.com').replace(/\/$/, '');
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

// ── All public data‑terminal routes ──────────────────────────────────────
const DATA_ROUTES: string[] = [
  '/data/markets/spot',
  '/data/markets/futures',
  '/data/markets/options',
  '/data/markets/indices',
  '/data/markets/cme-cots',
  '/data/markets/prices',
  '/data/markets/companies',
  '/data/markets/exchange-tokens',
  '/data/markets/sports-tokens',
  '/data/markets/volumes',
  '/data/markets/liquidations',
  '/data/markets/liquidity',
  '/data/etfs/bitcoin',
  '/data/etfs/ethereum',
  '/data/etfs/solana',
  '/data/etfs/xrp',
  '/data/etfs/crypto',
  '/data/etfs/comparison',
  '/data/treasuries/bitcoin',
  '/data/treasuries/ethereum',
  '/data/treasuries/solana',
  '/data/treasuries/crypto',
  '/data/stablecoins/usd',
  '/data/stablecoins/non-usd',
  '/data/stablecoins/non-fiat',
  '/data/stablecoins/chains',
  '/data/onchain/bitcoin',
  '/data/onchain/ethereum',
  '/data/onchain/solana',
  '/data/onchain/avalanche',
  '/data/onchain/aptos',
  '/data/onchain/comparison',
  '/data/onchain/flows',
  '/data/onchain/gas',
  '/data/scaling',
  '/data/scaling/l2-comparison',
  '/data/scaling/l1-evm',
  '/data/scaling/l1-non-evm',
  '/data/scaling/optimistic',
  '/data/scaling/zk',
  '/data/scaling/data-availability',
  '/data/defi/tvl',
  '/data/defi/revenue',
  '/data/defi/dex-volume',
  '/data/defi/yields',
  '/data/defi/lending',
  '/data/defi/restaking',
  '/data/defi/launchpads',
  '/data/defi/prediction',
  '/data/defi/derivatives',
  '/data/defi/rwa',
  '/data/defi/exploits',
  '/data/defi/social',
  '/data/defi/whale-watch',
  '/data/defi/large-swaps',
  '/data/defi/token-unlocks',
  '/data/nfts/volume',
  '/data/nfts/collections',
  '/data/nfts/art',
  '/data/nfts/gaming',
  '/data/nfts/marketplaces',
  '/data/alternative/funding',
  '/data/alternative/politics',
  '/data/alternative/web-traffic',
  '/data/alternative/app-usage',
  '/data/alternative/social',
  '/data/exchanges',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allTags, articleMetas, authors] = await Promise.all([
    getAllTags().catch(() => []),
    fetchArticleMetas(),
    fetchAuthors(),
  ]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,              lastModified: new Date(), changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${BASE_URL}/news`,          lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.95 },
    { url: `${BASE_URL}/news/search`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE_URL}/tags`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/authors`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/events`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/airdrops`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/price-indexes`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${BASE_URL}/bookmarks`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/terms`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // Data terminal routes
  const dataRoutes: MetadataRoute.Sitemap = DATA_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

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
    changeFrequency: 'monthly' as const,
    priority:       0.5,
  }));

  return [
    ...staticRoutes,
    ...dataRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...articleEntries,
    ...authorEntries,
  ];
}
