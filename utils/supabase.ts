import { createBrowserClient } from '@supabase/ssr';

// This ensures keys are never evaluated as undefined strings during Vercel's build phase
const getSupabaseClient = () => {
  const supabaseUrl = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL 
    : process.env.NEXT_PUBLIC_SUPABASE_URL;
    
  const supabaseAnonKey = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl || '', supabaseAnonKey || '');
};

export const supabase = getSupabaseClient();