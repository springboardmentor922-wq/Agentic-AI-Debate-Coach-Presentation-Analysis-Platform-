import { useState } from "react";
import { Link } from "react-router-dom";
import { Scale, ArrowRight } from "lucide-react";
import { authApi } from "../api/endpoints";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } finally {
      setLoading(false);
      setSubmitted(true);
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
          <h2 className="font-display text-2xl mb-1">Reset your password</h2>
          <p className="text-slate-muted text-sm mb-6">
            Enter your email and we'll generate a reset link.
          </p>

          {submitted ? (
            <p className="text-sm text-motion-teal bg-motion-teal/10 border border-motion-teal/30 rounded-lg px-3 py-3">
              If an account with that email exists, a reset link has been generated. Ask
              your administrator to check the backend console, or check your email if this
              were a production deployment.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-eyebrow block mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Sending…" : "Send reset link"} <ArrowRight size={16} />
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