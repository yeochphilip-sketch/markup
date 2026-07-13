import { createBrowserClient } from '@supabase/ssr';

// ───────────────────────────────────────────────────────────────────────────
//  Browser-side singleton. Used in every 'use client' component.
// ───────────────────────────────────────────────────────────────────────────
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = getSupabaseClient();
