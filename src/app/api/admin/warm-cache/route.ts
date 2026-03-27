/**
 * Cache Warm-up Endpoint
 * GET /api/admin/warm-cache
 * Call this after every deployment to pre-populate Redis before first user hits.
 *
 * Add to Vercel post-deploy hook or call manually:
 *   curl https://cryptobrainnews.com/api/admin/warm-cache \
 *     -H "x-admin-secret: YOUR_SECRET"
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, getSearchIndex } from '@/lib/articles';
import { fetchNewsByCategory } from '@/lib/news';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
 
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';
 
export async function GET(req: NextRequest) {
  if (ADMIN_SECRET && req.headers.get('x-admin-secret') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
 
  const start = Date.now();
  const results: Record<string, number> = {};
 
  // Warm global article feed
  try {
    const articles = await getAllArticles();
    results['articles:all'] = articles.length;
  } catch (e: any) { results['articles:all'] = -1; }
 
  // Warm search index
  try {
    const idx = await getSearchIndex();
    results['search:index'] = idx.length;
  } catch (e: any) { results['search:index'] = -1; }
 
  // Warm each category feed in parallel
  await Promise.allSettled(
    NEWS_CATEGORIES.map(async (cat) => {
      try {
        const items = await fetchNewsByCategory(cat.slug, 30);
        results[`category:${cat.slug}`] = items.length;
      } catch { results[`category:${cat.slug}`] = -1; }
    })
  );
 
  return NextResponse.json({
    warmed: true,
    durationMs: Date.now() - start,
    results,
  });
}
