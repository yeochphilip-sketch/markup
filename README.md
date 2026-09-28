# MARKUP

AI-powered practice and grading platform for Singapore GCE O-Level Humanities —
**Social Studies** and **Elective History**. Students generate SBQ, SEQ and SRQ
practice papers aligned to the SEAB syllabus, write timed answers, and receive
instant LORMS-aligned grades with targeted feedback.

- Live app: https://markup-five.vercel.app
- Tips & guides: `/tips` (17 exam-technique articles)
- Lead magnet: `/resources/sbq-template` (printable SBQ answer template)

## Tech stack

- **Next.js (App Router)** + React + TypeScript
- **Tailwind CSS v4**
- **Supabase** — auth, Postgres, RLS
- **Vercel AI SDK** with OpenAI + Google models for question generation and grading
- **Stripe** (dormant during beta — gated by `SHOW_POST_BETA_PRICING`)
- **Vitest** for unit tests, ESLint + `tsc` for checks

## Getting started

```bash
npm install

# Configure environment (see .env.example)
cp .env.example .env.local

npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Purpose |
|:--|:--|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run eval` | Grading quality evaluation harness |
| `npx tsc --noEmit` | Typecheck |
| `npx vitest run` | Unit tests |

## Environment variables

See `.env.example` for the full list. Key vars:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project (browser-safe anon key)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only admin key (never expose to the client)
- `SITE_URL` — canonical production origin, used by sitemap/robots/canonicals
- `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` — AI providers
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — payments (dormant in beta)
- `CRON_SECRET` — auth for scheduled email/cron routes

## Project layout

```
app/            App Router pages, API routes, components
  tips/         SEO tip articles (each exports metadata + canonical)
  dashboard/    Student practice surface (noindex)
  admin/        Internal admin tools (noindex)
lib/            Domain logic: grading, gamification, trial gate, SEO helpers
supabase/       SQL migrations and RLS policies
scripts/        One-off maintenance + asset-generation scripts
marketing/      TikTok content pack and launch assets
```

## SEO surfaces

Generated from `lib/site-config.ts` (single source of truth for the site URL
and public routes):

- `app/robots.ts` → `/robots.txt`
- `app/sitemap.ts` → `/sitemap.xml`
- `public/llms.txt` → LLM-facing site map
- JSON-LD: `lib/structured-data.ts` (LocalBusiness + WebApplication on `/`,
  BreadcrumbList on subpages)
- Brand assets: `app/favicon.ico`, `app/apple-icon.png`, `public/og-image.png`
  — regenerate with `node scripts/generate-brand-assets.js`

## Deployment

Deployed on Vercel. Launch-day operations (payments, emails, crons) and the
custom domain/HTTPS setup are documented in `LAUNCH_CHECKLIST.md`.
