import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // App surfaces are private/user-specific and have no SEO value.
        disallow: ['/dashboard', '/auth', '/admin', '/api'],
      },
      // Training-data crawlers honoured per emerging AI-robots conventions;
      // content-level guidance for LLMs lives in /llms.txt.
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'],
        allow: '/',
        disallow: ['/dashboard', '/auth', '/admin', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
