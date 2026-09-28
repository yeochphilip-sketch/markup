import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_URL, TIP_SLUGS, absoluteUrl } from '@/lib/site-config';

/**
 * Dynamic sitemap covering all indexable public routes.
 * /pricing is intentionally excluded — it 307s to / while SHOW_POST_BETA_PRICING is
 * false (see proxy.ts). Add it back here when payments launch.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: new Date(),
  }));

  const tipRoutes: MetadataRoute.Sitemap = TIP_SLUGS.map((slug) => ({
    url: absoluteUrl(`/tips/${slug}`),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    lastModified: new Date(),
  }));

  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1.0, lastModified: new Date() },
    ...staticRoutes.filter((r) => r.url !== SITE_URL),
    ...tipRoutes,
  ];
}
