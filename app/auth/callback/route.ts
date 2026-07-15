import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function sendWelcomeEmail(userId: string, email: string, name?: string) {
  try {
    // Fire-and-forget — never block the auth flow
    await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://markup-five.vercel.app'}/api/email/welcome`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, name }),
      },
    );
  } catch {
    // Non-critical — welcome email is best-effort
    console.warn('Welcome email skipped (non-fatal)');
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    // Crucial Fix: cookies() is an async Promise in newer Next.js versions
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method can be safely ignored if called from a Server Component
            }
          },
        },
      }
    );
    
    // Exchange the routing auth code for a secure cookie session
    await supabase.auth.exchangeCodeForSession(code);

    // Fire welcome email after successful signup
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || undefined;
      await sendWelcomeEmail(user.id, user.email, name);
    }
  }

  // Route cleanly to your destination path
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
