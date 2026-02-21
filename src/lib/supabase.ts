import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(
      '[Supabase] CRITICAL: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'All database operations will fail. Set these environment variables.'
    );
    // Still create a client to avoid null crashes, but log prominently
    _client = createClient(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder-key'
    );
  } else {
    _client = createClient(url, key);
  }

  return _client;
}

/**
 * Check if Supabase is properly configured.
 * Use this in health checks and startup validation.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
