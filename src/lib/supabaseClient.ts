import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  const error = 'Missing Supabase configuration. Please check your .env file.\nRequired: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
  console.error(error);
  throw new Error(error);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
