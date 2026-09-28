# 🚀 MARKUP — Beta → Post-Beta Launch Checklist

**Last updated:** 18 Aug 2026
**Status:** Waitlist beta — payments hidden, emails disabled, free trial funnel live.

This checklist captures every beta-to-post-beta reactivation step in one place. Nothing was
deleted during beta — everything below is gated by a flag, an env var, or a removed caller,
and can be switched back on with the steps here.

---

## 1. Current beta state (what's on / off today)

| Area | Status | Gate |
|:--|:--|:--|
| Trial funnel (3 free tries → waitlist → unlock) | ✅ LIVE | server-side `trial_tries_used` + `unlock_trial` RPC |
| Referral program (XP + free days) | ✅ LIVE | `/api/referral`, `apply_referral_bonus` RPC |
| Ambassador/influencer program (free codes) | ✅ LIVE | admin sets `subscription_tier = 'ambassador'` |
| Waitlist + feedback capture | ✅ LIVE | rate-limited (`WAITLIST_LIMIT` 5/60s, `FEEDBACK_LIMIT`) |
| Capacity fallback (503 + retry ETA toast) | ✅ LIVE | `AiCapacityError` in grade/generate routes |
| Marketing assets (TikTok pack, lead magnet) | ✅ LIVE | `marketing/tiktok-content-pack.md`, `/resources/sbq-template` |
| Admin analytics + aggregate stats | ✅ LIVE | `/admin/analytics` |
| **Pricing page + Stripe checkout/portal** | 🔒 OFF | `SHOW_POST_BETA_PRICING = false` in `lib/beta-flags.ts` |
| **Stripe webhook processing** | 🔒 OFF (signatures still verified) | beta guard in `app/api/webhooks/stripe/route.ts` |
| **All emails** | 🔒 OFF | `EMAILS_ENABLED = false` in 3 routes + removed callers + empty `crons` |
| `/pricing` route | 🔒 307 → `/` | `proxy.ts` checks `SHOW_POST_BETA_PRICING` |

---

## 2. Pre-launch prep (do this BEFORE launch day, in order)

### 2.1 — Apply pending SQL to production ⚠️ REQUIRED

Run **`supabase/delta_migration.sql`** in the Supabase SQL editor (it's idempotent — safe to
re-run). It must be applied **before launch day**, since it contains:

- `referral_bonus_days` column + `apply_referral_bonus` RPC + `unlock_trial` bonus stacking
  (free-days referral upgrade — already shipped in code, not yet in prod)
- `trial_tries_used` / `trial_unlocked_until` columns + `increment_trial_try` / `unlock_trial` RPCs
- Ambassador `subscription_tier` check, waitlist discount column, referral code columns

**Verify after running** (SQL editor → Query):
```sql
SELECT proname FROM pg_proc
WHERE proname IN ('unlock_trial', 'increment_trial_try', 'apply_referral_bonus')
ORDER BY 1;
-- Expect 3 rows

SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_skill_metrics'
  AND column_name IN ('trial_tries_used', 'trial_unlocked_until', 'referral_bonus_days');
-- Expect 3 rows
```
**Security check:** confirm RLS policies read the admin flag from `auth.jwt() -> 'app_metadata'`
(the JWT), NOT `user_metadata` (end-user editable). The Supabase linter flagged this before —
it was fixed, but re-scan policies after the migration.

### 2.2 — Clean up test data
- Delete `marketing-test@example.com` (and any other test rows) from `waitlist_signups` —
  inserted during the lead-magnet live test.
- Sweep `user_feedback` for placeholder/test entries if you want a clean beta dataset.

### 2.3 — Fix the broken `CRON_SECRET` env var ⚠️ REQUIRED before enabling crons
The current `CRON_SECRET` on Vercel contains **newline/control characters** (Vercel rejects
cron jobs with `Invalid characters in HTTP headers`). Regenerate it:
```bash
openssl rand -base64 32
```
Update the `CRON_SECRET` env var on Vercel with the new value.

### 2.4 — Fix the swapped Supabase keys on Vercel ⚠️ CRITICAL (security)
**Found 18 Aug 2026 during browser testing:** the two Supabase env vars are **swapped** —
`NEXT_PUBLIC_SUPABASE_ANON_KEY` holds the `sb_secret_…` (**service-role**) key and
`SUPABASE_SERVICE_ROLE_KEY` holds the `sb_publishable_…` (**anon**) key.

Impact: the browser ships the **admin key to every user** (anyone can read/write ALL tables,
bypassing every RLS policy — emails, feedback, subscription data), while server-side admin
calls silently run with anon privileges (RLS-limited reads).

- ✅ Already fixed in local `.env.local` (swapped back; verified: anon key now RLS-restricted,
  service key reads all rows, guest + signed-in flows re-tested 13/13 + 11/11).
- ⚠️ **Fix on Vercel now** — swap the two values in Project → Settings → Environment Variables,
  then redeploy. Verify with the health endpoint (`/api/health`) and by confirming the browser
  bundle no longer contains an `sb_secret_` key.

### 2.5 — Marketing readiness
- Bio/landing link → `/resources/sbq-template` (lead magnet captures email → waitlist).
- Execute the 60-day sprint from `marketing/tiktok-content-pack.md` (aligned to prelims → O-Levels).

---

## 3. Launch day — Payments (≈ 5 min, one flag + Stripe dashboard)

### Step 3.1 — Stripe Dashboard (do first)
1. **Create the waitlist coupon**: name `BETA-WAITLIST-20`, **20% off, forever** —
   must match `WAITLIST_COUPON_ID` in `lib/stripe.ts`. The checkout route applies it when
   `user_profiles.waitlist_discount > 0` (column already wired).
2. **Add webhook endpoint** → `https://<your-domain>/api/webhooks/stripe`
   Subscribe to these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
3. Copy the **webhook signing secret** → set `STRIPE_WEBHOOK_SECRET` on Vercel.
4. Confirm `STRIPE_SECRET_KEY` + price IDs (`getPriceId` in `lib/stripe.ts`) are set on Vercel.

### Step 3.2 — Flip the flag
In `lib/beta-flags.ts`:
```ts
export const SHOW_POST_BETA_PRICING = true;
```
One flip re-enables **all five** payment surfaces (verified):

| Surface | During beta | After flip |
|:--|:--|:--|
| Landing pricing section (`app/page.tsx`) | hidden | shows |
| `/pricing` page (`proxy.ts`) | 307 → `/` | loads |
| `/api/stripe/checkout` | 403 | creates Checkout Session |
| `/api/stripe/portal` | 403 | opens billing portal |
| Webhook processing | verified-but-ignored | writes to `user_profiles` |

### Step 3.3 — Deploy & verify (see §5)

---

## 4. Launch day — Emails (≈ 30 min)

### Step 4.1 — Set env vars on Vercel
- `RESEND_API_KEY` — from [resend.com](https://resend.com) (feedback alerts auto-activate the
  moment this is set — no code change).
- `CRON_SECRET` — regenerated value from §2.3.
- `NEXT_PUBLIC_SITE_URL` — should already be set; confirm it's the production domain.

### Step 4.2 — Code restorations (3 small changes)
All email **routes** still exist and are intact — they're just gated. Three callers/guards were
removed during beta and must be restored:

1. **Flip `EMAILS_ENABLED = true`** in all three routes:
   - `app/api/email/welcome/route.ts`
   - `app/api/email/daily-reminder/route.ts`
   - `app/api/email/practice-receipt/route.ts`

2. **Welcome email on signup** — restore the `sendWelcomeEmail(userId, email, name)` helper +
   its fire-and-forget call in `app/auth/callback/route.ts` (currently just the comment
   `// Welcome email disabled during beta` at line 39). The exact removed code is in git
   history (`git log -p -S 'email/welcome' -- app/auth/callback/route.ts`).

3. **Practice receipt after grading** — restore the fire-and-forget `fetch('/api/email/practice-receipt')`
   call in `app/api/grade/route.ts` after grading completes (currently just the comment
   `// Practice receipt email disabled during beta` at line 568). The removed payload
   (`email`, `name`, `scoreEstimate`, `subject`, `topic`, `skill`, `xpEarned`) is in git
   history (`git log -p -S 'email/practice-receipt' -- app/api/grade/route.ts`).

### Step 4.3 — Add crons

**Option A — Vercel Cron** (edit `vercel.json` `"crons"`):
```json
"crons": [
  { "path": "/api/email/daily-reminder", "schedule": "*/30 * * * *" },
  { "path": "/api/weekly-digest",        "schedule": "0 1 * * 0" }
]
```
Vercel auto-sends the `x-cron-secret` header (from `CRON_SECRET`) on cron hits — the
daily-reminder route accepts it.

**Option B — cron-job.org** (if you prefer external cron):
- Daily reminder: `GET https://<your-domain>/api/email/daily-reminder?secret=<CRON_SECRET>`
  every 30 min (route was designed for this; sends only to users whose preferred window is open).
- Weekly digest: `POST https://<your-domain>/api/weekly-digest` every Sunday.

⚠️ **Before enabling the weekly-digest cron**, add a `CRON_SECRET` auth check to the
`POST` handler in `app/api/weekly-digest/route.ts` — it currently takes no `Request` and
**cannot** verify the cron secret, so anyone could trigger a digest blast. Add the same
`isAuthorized()` pattern used in `app/api/email/daily-reminder/route.ts`.

---

## 5. Post-launch verification checklist

Run through this after the launch deploy:

**Payments**
- [ ] `/pricing` loads (no redirect) and shows both tiers
- [ ] Checkout session creates; Stripe test card succeeds; `subscription_tier` updates on the profile
- [ ] Waitlist user with `waitlist_discount > 0` sees the 20% coupon applied
- [ ] Billing portal opens and reflects the subscription
- [ ] Webhook received events (Stripe dashboard → Webhooks → recent deliveries shows 200s)

**Emails**
- [ ] New signup receives the welcome email
- [ ] Grading an essay triggers the practice receipt email
- [ ] Daily reminder fires within 30 min of an active user's last-active window
- [ ] Sunday digest sends to active users
- [ ] Feedback submission alerts the admin inbox

**Trial / gamification**
- [ ] New user: 3 free generations → gate → waitlist+feedback → unlock shows real day count
      (7 base, **9+ with referral bonus**) — toast/modal now derive from server `unlockExpiry`
- [ ] Referral claim: referee +2 days, referrer +1 (cap 7); banked days appear on next unlock

---

## 6. Already live — no action needed at launch

- Ambassador/influencer program — admin sets `subscription_tier = 'ambassador'` (free premium),
  issues their referral code. Works today.
- Referral codes + free-days rewards (XP retained as gamification bonus).
- Waitlist discount column (`waitlist_discount`) — dormant but wired for checkout.
- Rate limiting on generate / grade / feedback / waitlist (Supabase-backed, per-IP).
- AI capacity fallback — friendly 503 toast with real quota ETA from admin data.
- Marketing assets — TikTok content pack + SBQ template lead magnet.

---

## 7. Rollback (if something breaks)

- **Payments:** set `SHOW_POST_BETA_PRICING = false` → everything reverts to beta behavior in
  one deploy. Webhook keeps verifying signatures and ignoring events (no DB writes).
- **Emails:** set `EMAILS_ENABLED = false` in the 3 routes + remove the `crons` entries.
- **Crons:** delete from `vercel.json` or disable on cron-job.org.

---

## 9. Custom domain + HTTPS setup (≈ 30 min + DNS propagation)

The app currently runs on `markup-five.vercel.app`. Canonical URLs, sitemap, robots and
JSON-LD derive from the `SITE_URL` env var — the fallback in `lib/site-config.ts` is set to
the live Vercel URL, so the current deployment is already self-consistent. Do the steps
below **before** submitting the sitemap to Google so every canonical points at the final
domain from day one.

### Step 9.1 — Buy / point the domain
1. Register the domain with any registrar (or use Vercel's built-in registrar).
2. Choose the production apex (e.g. `markup.app`) and decide whether `www.` is the
   canonical host or a redirect. Pick **one** canonical host — all SEO surfaces must
   use it consistently.

### Step 9.2 — Add the domain in Vercel
1. Vercel dashboard → **Project → Settings → Domains → Add**.
2. Add both the apex (`markup.app`) and `www.markup.app`.
3. Vercel shows the DNS records to create:
   - Apex: `A` record → `76.76.21.21` (or `ALIAS`/`ANAME` if the registrar doesn't support
     CNAME flattening at apex).
   - `www`: `CNAME` → `cname.vercel-dns.com`.
4. In Vercel's domain settings, set the **primary/canonical** domain and redirect the
   other to it (e.g. `www` → apex, 308).

### Step 9.3 — HTTPS (automatic, verify anyway)
- Vercel provisions Let's Encrypt certificates automatically for every added domain —
  no manual step, no config flag.
- Wait for the dashboard to show **Valid** certificate status (can take a few minutes
  after DNS propagates).
- Verify: `curl -sI https://<domain> | head -5` → expect `HTTP/2 200` and no cert warnings.
- Verify the redirect: `curl -sI http://<domain>` → expect `301/308` to `https://`.
- Verify the non-canonical host redirects: `curl -sI https://www.<domain>` → expect
  `308` to the primary domain.

### Step 9.4 — Update the app's canonical origin ⚠️ REQUIRED
1. Vercel → **Settings → Environment Variables** → set `SITE_URL = https://<final-domain>`
   (Production + Preview).
2. Redeploy so the value propagates. This drives:
   - `<link rel="canonical">` on every page (`metadataBase` in `app/layout.tsx` +
     `lib/site-config.ts`)
   - `/sitemap.xml` URLs (`app/sitemap.ts`)
   - `/robots.txt` sitemap pointer (`app/robots.ts`)
   - JSON-LD `@id`/URL fields (`lib/structured-data.ts`)
3. Code fallback lives in `lib/site-config.ts` (currently `https://markup-five.vercel.app`)
   and is the single source of truth for `app/layout.tsx` metadataBase, sitemap, robots and
   JSON-LD. Update it there so local dev resolves absolute URLs to the new domain too.

### Step 9.5 — Post-launch SEO re-verification
- `curl -s https://<domain>/robots.txt` — allows crawlers, points at the new sitemap URL.
- `curl -s https://<domain>/sitemap.xml | head` — all `<loc>` URLs use the new origin.
- Spot-check a tip page's canonical: view-source on `/tips/sbq-comparison` →
  `<link rel="canonical" href="https://<domain>/tips/sbq-comparison">`.
- Submit the sitemap in Google Search Console (and Bing Webmaster Tools).
- If the domain changed from a previously indexed one, add 301 redirects from the old
  host in Vercel domain settings so link equity carries over.

---

## 8. Quick reference — env vars

| Variable | Needed for | Set? |
|:--|:--|:--|
| `NEXT_PUBLIC_SUPABASE_URL` | everything | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | server RPCs / admin queries | ✅ |
| `GROQ_API_KEY` | AI generate/grade | ✅ |
| `CRON_SECRET` | cron auth — **regenerate (has newlines)** | 🔒 |
| `RESEND_API_KEY` | all email routes | 🔒 |
| `STRIPE_SECRET_KEY` | checkout/portal/webhook | 🔒 |
| `STRIPE_WEBHOOK_SECRET` | webhook signature verification | 🔒 |
| `NEXT_PUBLIC_SITE_URL` | email + Stripe URLs | ✅ |
