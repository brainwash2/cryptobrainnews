// src/lib/supabase.ts
// ─── Single Supabase client for the entire app (browser-side) ────────────
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[Supabase] Credentials missing. Auth features will not function.'
    );
    // Return a non-functional client so the app doesn't crash
    _supabase = createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  } else {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return _supabase;
}

// Convenience export for components that expect `supabase` directly
export const supabase = getSupabase();
