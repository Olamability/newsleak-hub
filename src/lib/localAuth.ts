// Local authentication implementation
const USERS_STORAGE_KEY = 'newsleak_users';
const CURRENT_USER_KEY = 'newsleak_current_user';

export interface LocalUser {
  id: string;
  email: string;
  password: string; // In a real app, never store passwords like this!
  displayName?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

// Get all users from localStorage
function getUsers(): LocalUser[] {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save users to localStorage
function saveUsers(users: LocalUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Get current user
export function getCurrentUser(): AuthUser | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Set current user
function setCurrentUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export async function signUp(email: string, password: string) {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }
  
  const newUser: LocalUser = {
    id: Date.now().toString(),
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const authUser: AuthUser = {
    id: newUser.id,
    email: newUser.email,
    displayName: newUser.displayName,
  };
  
  setCurrentUser(authUser);
  
  return { user: authUser };
}

export async function signIn(email: string, password: string) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
  
  setCurrentUser(authUser);
  
  return { user: authUser };
}

export async function signOut() {
  setCurrentUser(null);
  return { error: null };
}

export async function resetPassword(email: string) {
  // Mock password reset - in a real app this would send an email
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Just simulate success
  return { error: null };
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  // Initial call
  callback(getCurrentUser());
  
  // Listen for storage events (multi-tab support)
  const handler = (e: StorageEvent) => {
    if (e.key === CURRENT_USER_KEY) {
      callback(e.newValue ? JSON.parse(e.newValue) : null);
    }
  };
  
  window.addEventListener('storage', handler);
  
  return {
    unsubscribe: () => window.removeEventListener('storage', handler),
  };
}
