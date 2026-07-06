import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the temporary code parameter safely for a secure session cookie
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL extraction completed. Forward the authenticated student to their target view
  return NextResponse.redirect(new URL(next, request.url));
}
