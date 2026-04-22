/**
 * lib/news/seo/metadata.ts
 * Next.js 16 Metadata API helpers for news pages.
 * Generates <title>, <meta>, Open Graph, Twitter Card, and canonical tags
 * from Sanity article/author data in one call per page type.
 *
 * GEO hardening applied:
 *   - Explicit description capped at 160 chars
 *   - og:type = 'article' with article:published_time
 *   - twitter:card = 'summary_large_image' for all article pages
 *   - robots: index, follow — no noindex leakage on valid pages
 *   - alternates.canonical to prevent duplicate content penalties
 */

import { type Metadata } from 'next';
import type { ArticleCard, ArticleFull } from '../sanity-queries';

const BASE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://cryptobrainnews.com';
const SITE_NAME = 'CryptoBrainNews';
const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? '@CryptoBrainNews';

function ogImageUrl(slug?: string, category?: string): string {
  const params = slug
    ? `slug=${encodeURIComponent(slug)}`
    : category
      ? `category=${encodeURIComponent(category)}`
      : '';
  return `${BASE_URL}/api/og${params ? `?${params}` : ''}`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

// ─── Article page metadata ────────────────────────────────────────────────────

export function buildArticleMetadata(article: ArticleFull | ArticleCard): Metadata {
  const url       = `${BASE_URL}/news/${article.slug}`;
  const ogImage   = ogImageUrl(article.slug);
  const description = truncate(article.metaDescription, 160);

  return {
    title:       `${article.title} | ${SITE_NAME}`,
    description,
    alternates:  { canonical: url },
    robots:      { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type:            'article',
      url,
      title:           article.title,
      description,
      siteName:        SITE_NAME,
      publishedTime:   article.publishedAt,
      authors:         article.author ? [`${BASE_URL}/news/author/${article.author.name}`] : [],
      tags:            article.tags,
      images: [
        {
          url:    ogImage,
          width:  1200,
          height: 630,
          alt:    article.title,
        },
      ],
    },
    twitter: {
      card:        'summary_large_image',
      site:        TWITTER_HANDLE,
      title:       article.title,
      description,
      images:      [ogImage],
    },
    other: {
      // Article-specific meta — consumed by aggregators and AI crawlers (GEO)
      'article:published_time': article.publishedAt,
      'article:section':        article.category,
      'article:tag':            article.tags.join(','),
    },
  };
}

// ─── Category page metadata ───────────────────────────────────────────────────

export function buildCategoryMetadata(category: string, total: number): Metadata {
  const url         = `${BASE_URL}/news/category/${encodeURIComponent(category.toLowerCase())}`;
  const title       = `${category} News & Analysis | ${SITE_NAME}`;
  const description = truncate(
    `Latest ${category} news, on-chain data, and market analysis. ${total} articles and growing.`,
    160,
  );

  return {
    title,
    description,
    alternates:  { canonical: url },
    robots:      { index: true, follow: true },
    openGraph: {
      type:        'website',
      url,
      title,
      description,
      siteName:    SITE_NAME,
      images: [{ url: ogImageUrl(undefined, category), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        'summary_large_image',
      site:        TWITTER_HANDLE,
      title,
      description,
      images:      [ogImageUrl(undefined, category)],
    },
  };
}

// ─── Search page metadata ─────────────────────────────────────────────────────

export function buildSearchMetadata(q: string, total: number): Metadata {
  const url = `${BASE_URL}/news/search?q=${encodeURIComponent(q)}`;
  return {
    title:       q ? `"${q}" – Search | ${SITE_NAME}` : `Search | ${SITE_NAME}`,
    description: q
      ? truncate(`${total} results for "${q}" on CryptoBrainNews.`, 160)
      : 'Search crypto news, on-chain analysis, and DeFi insights.',
    alternates:  { canonical: url },
    robots:      // Search result pages should not be indexed (duplicate content)
      { index: false, follow: true },
  };
}

// ─── Author page metadata (E-E-A-T hardened) ──────────────────────────────────

export interface AuthorMeta {
  name:        string;
  slug:        string;
  bio:         string | null;
  avatar:      string | null;
  credentials: string[];
  articleCount:number;
}

export function buildAuthorMetadata(author: AuthorMeta): Metadata {
  const url         = `${BASE_URL}/news/author/${author.slug}`;
  const credLine    = author.credentials.length
    ? ` ${author.credentials.join(', ')}.`
    : '';
  const description = truncate(
    author.bio
      ? `${author.bio.slice(0, 100)}${credLine}`
      : `${author.name} has published ${author.articleCount} articles on ${SITE_NAME}.${credLine}`,
    160,
  );

  return {
    title:       `${author.name} – Crypto Analyst | ${SITE_NAME}`,
    description,
    alternates:  { canonical: url },
    robots:      { index: true, follow: true },
    openGraph: {
      type:      'profile',
      url,
      title:     `${author.name} | ${SITE_NAME}`,
      description,
      siteName:  SITE_NAME,
      ...(author.avatar
        ? { images: [{ url: author.avatar, width: 400, height: 400, alt: author.name }] }
        : {}),
    },
    twitter: {
      card:        'summary',
      site:        TWITTER_HANDLE,
      title:       `${author.name} | ${SITE_NAME}`,
      description,
      ...(author.avatar ? { images: [author.avatar] } : {}),
    },
  };
}

// ─── Homepage metadata ────────────────────────────────────────────────────────

export function buildHomepageMetadata(): Metadata {
  const description = 'Data-first crypto intelligence: Bitcoin on-chain metrics, DeFi TVL, market analysis, and breaking news. Updated daily.';
  return {
    title:        `${SITE_NAME} – Data-First Crypto Intelligence`,
    description,
    alternates:   { canonical: BASE_URL },
    robots:       { index: true, follow: true },
    openGraph: {
      type:        'website',
      url:          BASE_URL,
      title:       `${SITE_NAME} – Data-First Crypto Intelligence`,
      description,
      siteName:    SITE_NAME,
      images:      [{ url: ogImageUrl(), width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card:        'summary_large_image',
      site:        TWITTER_HANDLE,
      title:       `${SITE_NAME} – Data-First Crypto Intelligence`,
      description,
      images:      [ogImageUrl()],
    },
  };
}
