import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-motion-teal/15 border border-motion-teal/30 flex items-center justify-center mb-4">
            <Scale className="text-motion-teal" size={28} />
          </div>
          <span className="font-display text-xl">Podium</span>
          <span className="text-xs text-slate-muted mt-1">AI Debate Coach &amp; Presentation Analysis</span>
        </div>

        <div className="card p-8">
          <h2 className="font-display text-2xl mb-1">Welcome back</h2>
          <p className="text-slate-muted text-sm mb-6">Sign in to continue to your dashboard.</p>

          <GoogleSignInButton />

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-slate-muted">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-eyebrow block mb-2">Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-eyebrow">Password</label>
                <Link to="/forgot-password" className="text-xs text-motion-teal hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-sm text-rebuttal-coral bg-rebuttal-coral/10 border border-rebuttal-coral/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="text-sm text-slate-muted mt-6 text-center">
          New to Podium?{" "}
          <Link to="/register" className="text-motion-teal hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}