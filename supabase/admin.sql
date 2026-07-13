-- ============================================================
-- MARKUP · Admin promotion cheatsheet
--
-- Auth gating in this app reads:
--   1. middleware.ts (server)        -> app_metadata.is_admin || user_metadata.is_admin
--   2. app/admin/analytics (client)  -> same + NEXT_PUBLIC_ADMIN_EMAIL fallback
--
-- NOTE: Setting is_admin = TRUE on the user_profiles table does NOT
-- unlock /admin/* — the middleware only inspects JWT claims, not the
-- table. Always edit auth.users.raw_app_meta_data, never user_profiles.
--
-- After running any UPDATE here, the affected user MUST sign out and
-- sign back in (or refresh their session token) so the JWT reflects
-- the new is_admin claim — until then, the JWT-claim middleware will
-- still bounce them to /dashboard.
-- ============================================================

-- ────────────────────────────────────────────────────────────────
-- 1. Promote a single user to admin by email
-- ────────────────────────────────────────────────────────────────
UPDATE auth.users
SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('is_admin', true)
WHERE email = 'your-admin-email@domain.com';


-- ────────────────────────────────────────────────────────────────
-- 2. Bulk promote several admins at once
-- ────────────────────────────────────────────────────────────────
UPDATE auth.users
SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('is_admin', true)
WHERE email = ANY (ARRAY[
    'your-admin-email@domain.com',
    'another-admin@domain.com'
]);


-- ────────────────────────────────────────────────────────────────
-- 3. Verify who is currently flagged as admin via JWT claims
-- ────────────────────────────────────────────────────────────────
SELECT
    id,
    email,
    raw_app_meta_data -> 'is_admin'      AS app_metadata_is_admin,
    raw_user_meta_data -> 'is_admin'    AS user_metadata_is_admin,
    created_at
FROM auth.users
WHERE
    (raw_app_meta_data   ->> 'is_admin') = 'true'
 OR (raw_user_meta_data ->> 'is_admin') = 'true'
ORDER BY created_at DESC;


-- ────────────────────────────────────────────────────────────────
-- 4. Revoke admin status (sets the flag back to false)
-- ────────────────────────────────────────────────────────────────
UPDATE auth.users
SET raw_app_meta_data =
    raw_app_meta_data
    - 'is_admin'
    || jsonb_build_object('is_admin', false)
WHERE email = 'your-admin-email@domain.com';


-- ────────────────────────────────────────────────────────────────
-- 5. Mirror the admin flag onto user_profiles for the analytics UI
--    (display-only – does NOT affect middleware gating)
-- ────────────────────────────────────────────────────────────────
UPDATE public.user_profiles AS p
SET is_admin = TRUE
WHERE p.email_address = 'your-admin-email@domain.com';


-- ============================================================
-- Troubleshooting checklist if /admin/* still bounces to /dashboard:
--   (a) Did the user sign out + sign back in after the UPDATE?
--       → The OLD JWT is cached until the session refreshes.
--   (b) Does the email in raw_app_meta_data match exactly?
--       → Case-sensitive. Run SELECT 1 to confirm.
--   (c) Did you accidentally write to user_profiles instead of
--       auth.users.raw_app_meta_data?
--       → Middleware does not read user_profiles.
--   (d) Is NEXT_PUBLIC_SUPABASE_URL set in Vercel env?
--       → Middleware cannot construct a client without it.
-- ============================================================
