/**
* Beta / post-beta feature switches.
*
* During the waitlist beta, paid features (pricing page + Stripe checkout)
* are hidden and blocked. After beta launch, flip SHOW_POST_BETA_PRICING to
* true in ONE place to re-enable:
* - the landing-page pricing section (app/page.tsx)
* - the standalone /pricing page (proxy.ts stops redirecting it)
* - the Stripe checkout API (app/api/stripe/checkout/route.ts)
*/
export const SHOW_POST_BETA_PRICING = false;
