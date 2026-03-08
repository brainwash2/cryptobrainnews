import { NextResponse } from 'next/server';
import { getSanityEvents } from '@/lib/sanity';

export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');

  try {
    let events = await getSanityEvents();

    if (featured === 'true') {
      events = events.filter((e: any) => e.isFeatured);
    }

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json([]);
  }
}
