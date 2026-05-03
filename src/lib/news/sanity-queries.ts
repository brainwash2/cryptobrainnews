/**
 * lib/news/sanity-queries.ts
 * All GROQ queries for the news section in one place.
 *
 * N+1 elimination strategy:
 *   Every query uses GROQ projections to resolve references (author, category,
 *   related articles) IN THE SAME ROUND TRIP rather than fetching a list then
 *   making per-item follow-up calls.
 *
 * Projection anatomy:
 *   "field": field           – rename
 *   "author": author->       – dereference a reference (one level)
 *   "tags": tags[]->name     – dereference array of references
 *   coalesce(a, b)           – fallback chain
 *   count(*)                 – aggregation (no data transfer)
 *
 * All queries return only the fields consumed by the UI — never select *
 * (prevents over-fetching and leaking unpublished draft fields via CDN).
 */

import { sanityFetch }      from './sanity-client';
import type { Redis }        from '@upstash/redis';

// ─── Shared projection fragments ──────────────────────────────────────────────

/** Minimal card fields — used in list views, related articles, search results. */
const ARTICLE_CARD_PROJECTION = `
  _id,
  title,
  "slug": slug.current,
  metaDescription,
  publishedAt,
  category,
  tags,
  sentiment,
  relatedTickers,
  "author": coalesce(author->{ name, "avatar": avatar.asset->url }, null),
  "coverImage": coalesce(
    coverImage.asset->url,
    null
  )
`;

/** Full article projection — used on single article pages only. */
const ARTICLE_FULL_PROJECTION = `
  ${ARTICLE_CARD_PROJECTION},
  body,
  sourceUrl,
  "related": *[
    _type == "article" &&
    slug.current != ^.slug.current &&
    count(tags[@ in ^.tags]) > 0
  ] | order(publishedAt desc) [0..2] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    category,
    tags,
    "coverImage": coverImage.asset->url
  }
`;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ArticleCard {
  _id:            string;
  title:          string;
  slug:           string;
  metaDescription:string;
  publishedAt:    string;
  category:       string;
  tags:           string[];
  sentiment:      'bullish' | 'bearish' | 'neutral';
  relatedTickers: string[];
  author:         { name: string; avatar: string | null } | null;
  coverImage:     string | null;
}

export interface ArticleFull extends ArticleCard {
  body:      string;
  sourceUrl: string;
  related:   Array<Omit<ArticleCard, 'metaDescription' | 'sentiment' | 'relatedTickers' | 'author'>>;
}

export interface CategoryPageData {
  articles:   ArticleCard[];
  total:      number;
  categories: string[];
}

export interface SearchPageData {
  results: ArticleCard[];
  total:   number;
}

// ─── Query: article list for home / RSS ───────────────────────────────────────

export async function getLatestArticles(limit = 20): Promise<ArticleCard[]> {
  return sanityFetch<ArticleCard[]>(
    `*[_type == "article"] | order(publishedAt desc) [0..$limit] {
      ${ARTICLE_CARD_PROJECTION}
    }`,
    { limit: limit - 1 }, // GROQ slices are inclusive on both ends
  );
}

// ─── Query: single article by slug ───────────────────────────────────────────

export async function getArticleBySlug(slug: string): Promise<ArticleFull | null> {
  return sanityFetch<ArticleFull | null>(
    `*[_type == "article" && slug.current == $slug][0] {
      ${ARTICLE_FULL_PROJECTION}
    }`,
    { slug },
  );
}

// ─── Query: category page (paginated) ────────────────────────────────────────
// Previously: getArticles() then getCategory(article.categoryId) per article = N+1
// Now: category resolved inline via projection

export async function getCategoryPage(
  category: string,
  page = 1,
  pageSize = 12,
): Promise<CategoryPageData> {
  const start = (page - 1) * pageSize;
  const end   = start + pageSize - 1;

  // Single round trip: articles + total count + all category names
  const [articles, total, categories] = await Promise.all([
    sanityFetch<ArticleCard[]>(
      `*[_type == "article" && category == $category]
       | order(publishedAt desc) [$start..$end] {
         ${ARTICLE_CARD_PROJECTION}
       }`,
      { category, start, end },
    ),
    sanityFetch<number>(
      `count(*[_type == "article" && category == $category])`,
      { category },
    ),
    // Distinct categories — one query, no loops
    sanityFetch<string[]>(
      `array::unique(*[_type == "article"].category)`,
    ),
  ]);

  return { articles, total, categories };
}

// ─── Query: tag page ──────────────────────────────────────────────────────────

export async function getTagPage(
  tag: string,
  page = 1,
  pageSize = 12,
): Promise<{ articles: ArticleCard[]; total: number }> {
  const start = (page - 1) * pageSize;
  const end   = start + pageSize - 1;

  const [articles, total] = await Promise.all([
    sanityFetch<ArticleCard[]>(
      `*[_type == "article" && $tag in tags]
       | order(publishedAt desc) [$start..$end] {
         ${ARTICLE_CARD_PROJECTION}
       }`,
      { tag, start, end } as Record<string, unknown>,
    ),
    sanityFetch<number>(
      `count(*[_type == "article" && $tag in tags])`,
      { tag } as Record<string, unknown>,
    ),
  ]);

  return { articles, total };
}

// ─── Query: full-text search ──────────────────────────────────────────────────
// Uses GROQ's match operator — no separate Algolia call needed for basic search.
// For production scale (>50k articles) swap body match for Algolia/Typesense.

export async function searchArticles(
  q: string,
  limit = 20,
): Promise<SearchPageData> {
  if (!q.trim()) return { results: [], total: 0 };

  const terms = q.trim().split(/\s+/).join(' ');

  const [results, total] = await Promise.all([
    sanityFetch<ArticleCard[]>(
      `*[_type == "article" && (
           title        match $terms ||
           metaDescription match $terms ||
           tags[]       match $terms ||
           relatedTickers[] match $terms
         )
       ] | order(publishedAt desc) [0..$limit] {
         ${ARTICLE_CARD_PROJECTION}
       }`,
      { terms, limit: limit - 1 },
    ),
    sanityFetch<number>(
      `count(*[_type == "article" && (
         title        match $terms ||
         metaDescription match $terms ||
         tags[]       match $terms ||
         relatedTickers[] match $terms
       )])`,
      { terms },
    ),
  ]);

  return { results, total };
}

// ─── Query: author page ────────────────────────────────────────────────────────

export interface AuthorPageData {
  author: {
    name:      string;
    bio:       string | null;
    avatar:    string | null;
    twitterUrl:string | null;
  } | null;
  articles: ArticleCard[];
  total:    number;
}

export async function getAuthorPage(slug: string, limit = 20): Promise<AuthorPageData> {
  // Author and their articles in one query via backReference pattern
  const [author, articles, total] = await Promise.all([
    sanityFetch<AuthorPageData['author']>(
      `*[_type == "author" && slug.current == $slug][0] {
         name,
         bio,
         "avatar": avatar.asset->url,
         twitterUrl
       }`,
      { slug },
    ),
    sanityFetch<ArticleCard[]>(
      `*[_type == "article" && author->slug.current == $slug]
       | order(publishedAt desc) [0..$limit] {
         ${ARTICLE_CARD_PROJECTION}
       }`,
      { slug, limit: limit - 1 },
    ),
    sanityFetch<number>(
      `count(*[_type == "article" && author->slug.current == $slug])`,
      { slug },
    ),
  ]);

  return { author, articles, total };
}

// ─── Query: sitemap data (lightweight) ────────────────────────────────────────

export async function getSitemapArticles(): Promise<
  Array<{ slug: string; publishedAt: string }>
> {
  return sanityFetch<Array<{ slug: string; publishedAt: string }>>(
    `*[_type == "article"] | order(publishedAt desc) {
       "slug": slug.current,
       publishedAt
     }`,
  );
}
