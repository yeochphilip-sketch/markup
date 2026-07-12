import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a lightweight standalone supabase client for edge lookup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Intercept attempts to access admin sub-routes
  if (url.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Handshake with Supabase Auth engine to fetch token email validation context
    const { data: { user } } = await supabase.auth.getUser(token);
    
    // Change this string to your explicit admin email account profile
    const ALLOWED_ADMIN = 'your-admin-email@domain.com';

    if (!user || user.email !== ALLOWED_ADMIN) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
