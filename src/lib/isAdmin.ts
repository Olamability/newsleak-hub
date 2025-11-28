import { supabase } from './supabaseClient';

export async function isAdmin(userId: string): Promise<boolean> {
  // Assumes you have a 'profiles' table with a 'role' column
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (error) return false;
  return data?.role === 'admin';
}
