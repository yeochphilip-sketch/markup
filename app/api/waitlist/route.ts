import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Minimal server client — service role for inserts, anon for admin reads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email, name, subject } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await supabase.from('waitlist_signups').insert({
      email: normalizedEmail,
      name: name?.trim() || null,
      subject: subject || 'Both',
    });

    if (error) {
      // Unique violation — already signed up
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'You are already on the waitlist!' },
          { status: 200 },
        );
      }
      console.error('Waitlist insert error:', error);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'You are on the waitlist! We will be in touch soon.' },
      { status: 201 },
    );
  } catch (err) {
    console.error('Waitlist POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Authenticate via Bearer token (service role) or rely on Supabase session
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    const adminFlag =
      user?.app_metadata?.is_admin === true ||
      user?.user_metadata?.is_admin === true;

    if (!user || !adminFlag) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await adminClient
      .from('waitlist_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Waitlist fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
    }

    return NextResponse.json({ signups: data }, { status: 200 });
  } catch (err) {
    console.error('Waitlist GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
