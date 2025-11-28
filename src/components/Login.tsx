
import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";


export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isRegister) {
      if (!firstName.trim() || !lastName.trim() || !username.trim()) {
        setError("Please fill in all fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }
    setLoading(true);
    try {
      if (isRegister) {
        const { user, error: signUpError } = await signUp(email, password);
        if (signUpError) throw signUpError;
        // Insert profile into Supabase
        // Wait for user to be available (may be in user or session)
        let userId = user?.id;
        if (!userId) {
          // Try to get from current session
          const sessionUser = supabase.auth.getUser && (await supabase.auth.getUser()).data.user;
          userId = sessionUser?.id;
        }
        if (userId) {
          await supabase.from('profiles').insert({
            id: userId,
            first_name: firstName,
            last_name: lastName,
            username,
            email
          });
        }
      } else {
        await signIn(email, password);
      }
      // After successful login/signup, redirect to intended page or home
      const state = location.state as any;
      if (state?.from) {
        navigate(state.from, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (e: any) {
      setError(e.message || e.error_description || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded shadow mt-12">
      <h2 className="text-xl font-bold mb-4">{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={handleEmail} className="space-y-3">
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        {isRegister && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        )}
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {isRegister ? "Register" : "Login"}
        </button>
      </form>
      <div className="text-sm mt-4 text-center">
        <button
          type="button"
          className="text-primary underline"
          onClick={() => setIsRegister(r => !r)}
        >
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};
