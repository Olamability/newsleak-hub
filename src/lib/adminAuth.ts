import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

const ADMIN_TABLE = 'admins';

export async function adminSignUp(email: string, password: string) {
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from(ADMIN_TABLE).insert([{ email, password_hash }]);
  if (error) throw error;
  return data;
}

export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.from(ADMIN_TABLE).select('*').eq('email', email).single();
  if (error || !data) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) throw new Error('Invalid credentials');
  // Store admin session in localStorage
  localStorage.setItem('admin_session', JSON.stringify({ id: data.id, email: data.email }));
  return { id: data.id, email: data.email };
}

export function adminSignOut() {
  localStorage.removeItem('admin_session');
}

export function getAdminSession() {
  const session = localStorage.getItem('admin_session');
  return session ? JSON.parse(session) : null;
}
