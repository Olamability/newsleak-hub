import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Check if user is admin (assume 'is_admin' custom claim or role)
      const user = data.user;
      if (user && (user.role === "admin" || user.user_metadata?.role === "admin" || user.app_metadata?.role === "admin")) {
        navigate("/admin", { replace: true });
      } else {
        setError("Access denied: Not an admin user.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login as Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}
