import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// ───────────────────────────────────────────────────────────────────────────
//  Supabase server utilities
//
//  These provide a fallback when SUPABASE_SERVICE_ROLE_KEY is not configured
//  (or is incorrect). Routes that only need to read/write the authenticated
//  user's own data can use getServerSupabase() + getAuthUserId() instead.
//
//  The RLS policies in schema.sql / delta_migration.sql already allow users
//  to SELECT / INSERT / UPDATE their own rows in user_skill_metrics and
//  user_notifications — so the anon key + session cookies work fine.
// ───────────────────────────────────────────────────────────────────────────

export type ServerSupabase = ReturnType<typeof createServerClient>;

/**
 * Creates an authenticated Supabase client using the request's cookies.
 * Respects RLS policies — the user can only access their own data.
 *
 * Use this as a fallback when SUPABASE_SERVICE_ROLE_KEY is not available.
 */
export async function getServerSupabase(): Promise<ServerSupabase> {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Can be safely ignored in API routes / Server Components
          }
        },
      },
    },
  );
}

/**
 * Gets the authenticated user ID from the session cookie.
 * Returns null if not authenticated or if cookies are unavailable.
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Creates a Supabase admin client using the service role key.
 * Returns null if the key is not configured.
 *
 * Use this when you need to bypass RLS (e.g. reading all users' data
 * for leaderboard, sending emails, etc.).
 */
export function getServiceRoleClient(): ReturnType<typeof createClient> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
