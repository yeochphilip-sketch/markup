/**
* Central site configuration for SEO surfaces (sitemap, robots, llms.txt,
  * canonical URLs, JSON-LD).
*
* The canonical origin comes from SITE_URL (set on Vercel) with the live
* production deployment as the fallback. Every SEO surface derives from here,
* so switching to a custom domain is a one-line change (plus the Vercel env var).
*/
export const SITE_URL = (process.env.SITE_URL || 'https://markup-five.vercel.app').replace(/\/$/, '');

export const SITE_NAME = 'MARKUP';

/** Routes that belong in the sitemap. /pricing is excluded — it 307s to / while in beta. */
export const PUBLIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/tips', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/resources/sbq-template', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
] as const;

/** Tip article slugs — keep in sync with the folders under app/tips/<slug>/page.tsx. */
export const TIP_SLUGS = [
  'sbq-source-analysis',
  'sbq-comparison',
  'sbq-reliability',
  'sbq-purpose',
  'sbq-utility-comparison',
  'sbq-templates',
  'model-sbq-answer',
  'peel-framework',
  'seq-evaluation',
  'seq-history-guide',
  'history-vs-social-studies',
  'historical-context-essays',
  'intro-conclusions',
  'common-mistakes',
  'srq-guide',
  'study-strategy',
  'exam-week-strategy',
] as const;

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}
