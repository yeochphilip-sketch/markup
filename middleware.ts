import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Only intercept /admin/* routes – everything else passes through.
  if (url.pathname.startsWith('/admin')) {
    let response = NextResponse.next({ request: { headers: req.headers } });

    // ─────────────────────────────────────────────────────────────
    // TEMP DEBUG – drop me once /admin/* auth flows correctly.
    // Logs the cookie names Edge sees + the post-validation verdict
    // so vercel logs --prod | grep 'admin-gate' shows everything
    // needed to diagnose a redirect loop.
    // ─────────────────────────────────────────────────────────────
    const cookiesSeen = req.cookies.getAll();
    console.log('[admin-gate]', {
      pathname: url.pathname,
      url: req.url,
      cookieNames: cookiesSeen.map((c) => c.name),
      hasSbAuthCookie: cookiesSeen.some(
        (c) => c.name.startsWith('sb-') && c.name.includes('auth-token'),
      ),
      hasAuthCodeCookie: cookiesSeen.some((c) => c.name.includes('code-verifier')),
    });

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
      error: getUserError,
    } = await supabase.auth.getUser();

    console.log('[admin-gate]', {
      pathname: url.pathname,
      userFound: !!user,
      userEmail: user?.email ?? null,
      hasAppMetaIsAdmin: user?.app_metadata?.is_admin === true,
      hasUserMetaIsAdmin: user?.user_metadata?.is_admin === true,
      supabaseError: getUserError?.message ?? null,
      supabaseErrorStatus: getUserError?.status ?? null,
    });
    // ─────────────────────────────────────────────────────────────

    // Unauthenticated → bounce to auth screen.
    if (!user) {
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    // Look up admin flag in profile (avoid hard-coded emails entirely).
    const isAdminFlag =
      user.app_metadata?.is_admin === true ||
      user.user_metadata?.is_admin === true;

    if (!isAdminFlag) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals + static assets to keep middleware cheap.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
