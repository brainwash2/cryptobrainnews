import { NextRequest, NextResponse } from 'next/server';
import { getSearchIndex } from '@/lib/articles';

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase() || '';
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], query: q });
  }

  const index = await getSearchIndex();

  const results = index.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.body.toLowerCase().includes(q) ||
    a.categories.some(c => c.toLowerCase().includes(q)) ||
    a.source.toLowerCase().includes(q)
  ).slice(0, 40);

  return NextResponse.json({ results, query: q });
}
