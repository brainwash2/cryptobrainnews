/**
 * app/api/news/category/[slug]/route.ts
 * Edge-compatible category page data API.
 */
import { NextRequest, NextResponse } from 'next/server';
import { PageCache }       from '../../../../../lib/news/page-cache';
import { getCategoryPage } from '../../../../../lib/news/sanity-queries';

export const runtime = 'edge';

const cache = new PageCache();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },  // params is now a Promise
): Promise<NextResponse> {
  const { slug: category } = await params;  // await it!
  const page     = Number(req.nextUrl.searchParams.get('page')  ?? '1');
  const pageSize = Number(req.nextUrl.searchParams.get('limit') ?? '12');

  if (!category || category.length > 80) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  if (page < 1 || page > 500 || pageSize < 1 || pageSize > 50) {
    return NextResponse.json({ error: 'Invalid pagination' }, { status: 400 });
  }

  const key = PageCache.buildKey({ category, page, pageSize });

  try {
    const { data, fromCache } = await cache.getOrSet(
      'category',
      key,
      () => getCategoryPage(category, page, pageSize),
    );

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control':   's-maxage=300, stale-while-revalidate=600',
        'X-Cache':         fromCache ? 'HIT' : 'MISS',
        'X-Cache-Key':     key,
        'Content-Type':    'application/json',
      },
    });
  } catch (err) {
    console.error('[category-route] error', { category, page, err });
    return NextResponse.json(
      { error: 'Failed to load category data' },
      { status: 502 },
    );
  }
}

/** Sanity webhook invalidation — call from /api/sanity/webhook */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug: category } = await params;
  await Promise.all(
    [1, 2, 3, 4, 5].map((page) =>
      cache.invalidate('category', PageCache.buildKey({ category, page, pageSize: 12 })),
    ),
  );
  return NextResponse.json({ invalidated: category });
}
