import 'server-only';
/**
 * lib/news/sanity-client.ts
 * Two purposefully-separated Sanity clients:
 *
 *   readClient  — useCdn: true, no token
 *                 Hits Sanity's global CDN edge cache.
 *                 Use for ALL read queries (category pages, search, article fetch).
 *                 Latency: ~20–50 ms globally vs ~200–400 ms for API.
 *
 *   writeClient — useCdn: false, SANITY_API_TOKEN required
 *                 Bypasses CDN, talks directly to Sanity API.
 *                 Use ONLY in pipeline scripts (daily-article.ts) and
 *                 server-side mutations. Never ship to the browser.
 *
 * Separation prevents the common mistake of accidentally using an
 * authenticated token on CDN requests (which disables CDN caching).
 */

import { createClient, type SanityClient, type QueryParams } from '@sanity/client';

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production';
const API_TOKEN  = process.env.SANITY_API_TOKEN              ?? '';
const API_VERSION = '2024-01-01';

if (!PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set');
}

// ─── CDN read client (public, no token) ──────────────────────────────────────
export const readClient: SanityClient = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  apiVersion: API_VERSION,
  useCdn:     true,       // ← critical: enables Sanity CDN edge caching
  token:      undefined,  // ← critical: token disables CDN – never pass here
  perspective: 'published',
});

// ─── Direct API write client (server-only, never import on client) ───────────
export const writeClient: SanityClient = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  apiVersion: API_VERSION,
  useCdn:     false,      // ← must be false for mutations
  token:      API_TOKEN,
});

// ─── Query helper with timeout ────────────────────────────────────────────────
const QUERY_TIMEOUT_MS = 10_000;

export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  client: SanityClient = readClient,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);
  try {
    return await client.fetch<T>(query, params, {
      signal: controller.signal as AbortSignal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Health check (used by /api/health route) ─────────────────────────────────
export async function sanityHealthCheck(): Promise<boolean> {
  try {
    await sanityFetch<unknown>('*[_type == "article"][0]._id');
    return true;
  } catch {
    return false;
  }
}
