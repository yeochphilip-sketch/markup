import { SITE_NAME, SITE_URL, absoluteUrl } from './site-config';

/**
* JSON-LD structured data builders (schema.org).
* Injected via <script type="application/ld+json"> and kept minimal:
* the site's own pages are the only entities described.
*/

/** Organization behind MARKUP (used with LocalBusiness on the home page). */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/og-image.png'),
    image: absoluteUrl('/og-image.png'),
    description:
    'AI-powered O-Level Humanities practice platform for Singapore students. LORMS-aligned SBQ, SEQ and SRQ grading aligned to the SEAB syllabus.',
    areaServed: {
      '@type': 'Country',
      name: 'Singapore',
    },
    priceRange: 'Free during beta',
    sameAs: [] as string[],
  };
}

/** WebApplication entity describing the product itself. */
export function webAppJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#webapp`,
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description:
    'Scan your O-Level Humanities essays and get instant LORMS-aligned grades with targeted feedback. Practice SBQ, SEQ and SRQ questions generated for the Singapore SEAB syllabus.',
    inLanguage: 'en-SG',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SGD',
      description: 'Free during beta — 3 practice papers without an account.',
    },
  };
}

export interface Crumb {
  name: string;
  href: string;
}

/** BreadcrumbList for a page, from root to current. Last item is the current page. */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.href),
        })),
  };
}

/** Render a JSON-LD object as a <script> tag payload. */
export function jsonLdScript(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
