import { NextResponse } from 'next/server';
import { cached } from '@/lib/cache';
import { getSupabase } from '@/lib/supabase';
import type { CryptoEvent } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const featured = searchParams.get('featured');

  const events = await cached(
    `events:${type || 'all'}:${featured || 'all'}`,
    async () => {
      const supabase = getSupabase();
      let query = supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (type) query = query.eq('event_type', type);
      if (featured === 'true') query = query.eq('is_featured', true);

      const { data, error } = await query.limit(100);
      if (error || !data) return [];

      return data as CryptoEvent[];
    },
    300
  );

  return NextResponse.json(events);
}
