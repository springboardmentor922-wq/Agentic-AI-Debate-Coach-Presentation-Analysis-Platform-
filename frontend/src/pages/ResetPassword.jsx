import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Scale, ArrowRight } from "lucide-react";
import { authApi } from "../api/endpoints";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Scale className="text-motion-teal" size={22} />
          <span className="font-display text-lg">Podium</span>
        </div>

        <div className="card p-8">
          <h2 className="font-display text-2xl mb-1">Set a new password</h2>
          <p className="text-slate-muted text-sm mb-6">Choose a new password for your account.</p>

          {!token ? (
            <p className="text-sm text-rebuttal-coral bg-rebuttal-coral/10 border border-rebuttal-coral/30 rounded-lg px-3 py-2">
              This link is missing a reset token. Request a new one.
            </p>
          ) : success ? (
            <p className="text-sm text-motion-teal bg-motion-teal/10 border border-motion-teal/30 rounded-lg px-3 py-2">
              Password reset! Redirecting you to sign in…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-eyebrow block mb-2">New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input-field"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-rebuttal-coral bg-rebuttal-coral/10 border border-rebuttal-coral/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Saving…" : "Reset password"} <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        <p className="text-sm text-slate-muted mt-6 text-center">
          <Link to="/login" className="text-motion-teal hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}