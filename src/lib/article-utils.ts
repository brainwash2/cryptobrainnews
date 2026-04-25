// Client-safe utility functions for articles.
// NO server imports — safe to use in 'use client' components.
import type { WeightedArticle } from './types';

/** Returns the canonical href for an article card link. */
export function articleHref(article: WeightedArticle): string {
  if (article.sourceType === 'editorial' || article.sourceType === 'alpha') {
    return `/news/${article.id}`;
  }
  // Fallback to internal link if no external URL is available
  return article.url ?? `/news/${article.id}`;
}