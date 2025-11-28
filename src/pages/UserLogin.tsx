import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";


export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      const from = (location.state as any)?.from || "/";
      navigate(from, { replace: true });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    if (!registerName.trim() || !registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerConfirmPassword.trim()) {
      setRegisterError("All fields are required.");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }
    setRegisterLoading(true);
    const { error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        data: {
          name: registerName,
          username: registerUsername
        }
      }
    });
    setRegisterLoading(false);
    if (error) {
      setRegisterError(error.message);
    } else {
      setEmail(registerEmail);
      setPassword(registerPassword);
      setIsRegister(false);
      setRegisterName("");
      setRegisterUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setRegisterError("");
      setTimeout(() => {
        document.getElementById("login-form")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        {isRegister ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={registerName}
              onChange={e => setRegisterName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={registerUsername}
              onChange={e => setRegisterUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={registerConfirmPassword}
              onChange={e => setRegisterConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            {registerError && <div className="text-red-500 text-sm">{registerError}</div>}
            <Button type="submit" className="w-full" disabled={registerLoading}>
              {registerLoading ? "Registering..." : "Register"}
            </Button>
            <div className="text-sm text-center">
              Already have an account?{' '}
              <button type="button" className="text-primary underline" onClick={() => setIsRegister(false)}>
                Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} id="login-form" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">User Login</h2>
            <input
              type="email"
              placeholder="Email"
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
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-sm text-center">
              Don't have an account?{' '}
              <button type="button" className="text-primary underline" onClick={() => setIsRegister(true)}>
                Register
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
