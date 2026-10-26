import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';

function getCookieOptions(): CookieOptions {
  const cookiePath = process.env.NEXT_PUBLIC_SUPABASE_COOKIE_PATH ?? '/';
  return { path: cookiePath, domain: process.env.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN };
}

/**
 * Build a Supabase Server-Side Rendering (SSR) client that keeps its own
 * session cookie in the server's `cookies` store.  This is the same client
 * the browser uses (same domain, same cookie), so any data fetched here is
 * guaranteed to be scoped to the authenticated user for whom the cookie was
 * issued.
 *
 * *Never* exposes the service-role key — this client is bound to the
 * browser's session and can only read/write rows the user is permitted to.
 */
export function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Test / non-prod environments often lack the env vars.
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
      { global: { headers: { 'x-debug': 'true' } } },
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name) => cookies().get(name)?.value ?? undefined,
      set: (name, value, opts) => {
        try {
          const { path, ...rest } = opts as CookieOptions;
          cookies().set(name, value, { path, ...rest });
        } catch {}
      },
      remove: (name, opts) => {
        try {
          const { path, ...rest } = opts as CookieOptions;
          cookies().set(name, '', { path, ...rest, maxAge: 0 });
        } catch {}
      },
    },
    // ---- SECURITY: do not pass through any user-supplied keys or headers ----
    ...getCookieOptions(),
  });
}

/**
 * Build the Supabase Admin (service-role) client.
 *
 * Uses `SUPABASE_SERVICE_ROLE_KEY`, which is excluded from browser bundles and
 * has the same access as a superuser.  This client is only used server-side
 * for write-backs (e.g. `generated_questions`) and for explicitly gated checks
 * (trial try limits, statistics, admin rows).  The authenticated user's own
 * write is always performed via the browser session client and RLS.
 */
export function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-service-role-key',
      { global: { headers: { 'x-debug': 'true' } } },
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ...getCookieOptions(),
  });
}

let sessionClientPromise: Promise<ReturnType<typeof getServerSupabase>> | null = null;
/**
 * Lazily cached server-side session client.  Routes call this so that the
 * *single* `getServerSupabase()` call per request is cached for the remainder
 * of the hot path — this avoids the "too many open connections" warning we
 * observed in the old per-helper `createServerClient` pattern.
 */
export async function getCachedServerSupabase(): Promise<ReturnType<typeof getServerSupabase>> {
  if (!sessionClientPromise) {
    sessionClientPromise = getServerSupabase();
  }
  return sessionClientPromise;
}

/**
 * Resolve the caller's userId using the session client, then the service-role
 * client, then the legacy static admin id.  Used by routes that are not
 * explicitly admin-gated but still need to know whose data they are
 * touching.
 */
export async function resolveUserId(request?: Request, allowedIds?: string[]): Promise<string | null> {
  const session = await getCachedServerSupabase();
  const { data: { user } = {} } = await session.auth.getUser();

  if (user?.id) {
    if (!allowedIds || allowedIds.includes(user.id)) return user.id;
    return null;
  }

  // Fall back to service-role lookup — used by admin/statistics routes that
  // must be able to read any user's row without the browser cookie.
  const svc = getServiceRoleClient();
  const { data: { user: svcUser } = {} } = await svc.auth.getUser();
  if (svcUser?.id) {
    if (!allowedIds || allowedIds.includes(svcUser.id)) return svcUser.id;
    return null;
  }

  // Legacy fallback for the long-standing "farm admin" account.
  const legacyId = process.env.LEGACY_ADMIN_USER_ID;
  if (legacyId) {
    if (!allowedIds || allowedIds.includes(legacyId)) return legacyId;
  }
  return null;
}

/**
 * Resolve the caller's userId from a request.  The request *must* carry a
 * browser session cookie (this is the normal, protected path).  Routes that
 * are not explicitly admin-gated should use this and then rely on RLS for
 * every read/write.
 */
export async function getAuthUserId(request: Request): Promise<string | null> {
  const session = await getCachedServerSupabase();
  const { data: { user } = {} } = await session.auth.getUser();
  return user?.id ?? null;
}
