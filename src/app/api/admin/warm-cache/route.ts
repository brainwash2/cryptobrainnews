import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, getSearchIndex } from '@/lib/articles';
import { fetchNewsByCategory } from '@/lib/news';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
 
export const maxDuration = 60;
 
export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (secret && req.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
 
  const start = Date.now();
  const results: Record<string, number | string> = {};
 
  // Warm global article feed
  try {
    const articles = await getAllArticles();
    results['articles:all'] = articles.length;
  } catch { results['articles:all'] = 'error'; }
 
  // Warm search index
  try {
    const idx = await getSearchIndex();
    results['search:index'] = idx.length;
  } catch { results['search:index'] = 'error'; }
 
  // Warm all category feeds in parallel
  await Promise.allSettled(
    NEWS_CATEGORIES.map(async (cat) => {
      try {
        const items = await fetchNewsByCategory(cat.slug, 30);
        results[`category:${cat.slug}`] = items.length;
      } catch {
        results[`category:${cat.slug}`] = 'error';
      }
    })
  );
 
  return NextResponse.json({
    warmed: true,
    durationMs: Date.now() - start,
    results,
  });
}
