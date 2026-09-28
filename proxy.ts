import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SHOW_POST_BETA_PRICING } from '@/lib/beta-flags';

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Post-beta only: while the waitlist beta is running, no one can pay —
  // redirect the /pricing page back to the landing page (and the checkout
  // API is guarded in app/api/stripe/checkout/route.ts). Flip
  // SHOW_POST_BETA_PRICING in lib/beta-flags.ts to re-enable.
  if (!SHOW_POST_BETA_PRICING && url.pathname === '/pricing') {
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Only intercept /admin/* routes – everything else passes through.
  if (url.pathname.startsWith('/admin')) {
    let response = NextResponse.next({ request: { headers: req.headers } });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: { headers: req.headers } });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Unauthenticated → bounce to auth screen.
    if (!user) {
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    // Look up admin flag in profile (avoid hard-coded emails entirely).
    // NOTE: app_metadata only — user_metadata is end-user-editable and must
    // never be trusted for security checks.
    const isAdminFlag = user.app_metadata?.is_admin === true;

    if (!isAdminFlag) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals + static assets to keep proxy cheap.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
