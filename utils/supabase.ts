import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// This keeps browser client tokens perfectly synced with Next.js Server Components
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);