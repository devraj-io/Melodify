import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://YOUR_PROJECT_ID.supabase.co') {
  console.warn(
    '⚠️  Supabase not configured! Open .env.local and replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with your real Supabase credentials.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
