/**
 * Shared Supabase server utilities.
 *
 * The Single Source of Truth for all server-side Supabase access:
 *  - `getServerSupabase()`  — cookie-bound, session-scoped client
 *  - `getServiceRoleClient()` — admin (service-role) client
 *  - `resolveUserId()`       — canonical session → svc → legacy admin resolution
 *  - `getAuthUserId()`       — session-bound userId for protected routes
 *
 * Every API route, queue worker and side-effect worker imports these helpers
 * instead of building their own `createServerClient`/`createClient` calls.
 * This means a single `getServerSupabase()` call is cached for the life of a
 * hot request, the service-role key never appears in client bundles, and any
 * new route that needs Supabase inherits the session/RLS boundary for free.
 */export { getServerSupabase, getServiceRoleClient, resolveUserId, getAuthUserId } from '@/lib/supabase';
