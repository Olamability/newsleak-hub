import { supabase } from './supabaseClient';

const ADMIN_TABLE = 'admins';

export async function adminSignUp(email: string, password: string) {
  // First, check if admin table exists and if user should be admin
  // For now, we'll use a simple approach: store admin emails in the admins table
  // with a flag, and use Supabase Auth for authentication
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) throw authError;
  
  // Add user to admins table
  if (authData.user) {
    const { error: adminError } = await supabase.from(ADMIN_TABLE).insert([
      { 
        email, 
        user_id: authData.user.id,
        created_at: new Date().toISOString()
      }
    ]);
    
    if (adminError) {
      // If adding to admin table fails, still allow the user to be created
      console.error('Failed to add admin record:', adminError);
    }
    
    // Store admin session in localStorage
    localStorage.setItem('admin_session', JSON.stringify({ 
      id: authData.user.id, 
      email: authData.user.email 
    }));
  }
  
  return authData;
}

export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Verify user is in admins table
  const { data: adminData, error: adminError } = await supabase
    .from(ADMIN_TABLE)
    .select('*')
    .eq('email', email)
    .single();
  
  if (adminError || !adminData) {
    await supabase.auth.signOut();
    throw new Error('Not authorized as admin');
  }
  
  // Store admin session in localStorage
  if (data.user) {
    localStorage.setItem('admin_session', JSON.stringify({ 
      id: data.user.id, 
      email: data.user.email 
    }));
  }
  
  return { id: data.user?.id, email: data.user?.email };
}

export async function adminSignOut() {
  await supabase.auth.signOut();
  localStorage.removeItem('admin_session');
}

export function getAdminSession() {
  const session = localStorage.getItem('admin_session');
  return session ? JSON.parse(session) : null;
}
