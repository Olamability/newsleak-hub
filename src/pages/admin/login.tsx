import { useState } from 'react';
import { adminSignIn } from '@/lib/adminAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
  await adminSignIn(email, password);
  window.location.href = '/admin/add-feed';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-sm text-center mt-2">
          Don't have an account?{' '}
          <a href="/admin/signup" className="text-primary underline hover:opacity-80">Sign Up</a>
        </div>
      </form>
    </div>
  );
}
