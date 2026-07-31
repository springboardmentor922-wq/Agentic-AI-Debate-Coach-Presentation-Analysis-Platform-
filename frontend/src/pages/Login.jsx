import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mic, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const Login = ({ onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success) {
        loginUser({
          username: res.username,
          fullname: res.fullname,
          email: res.email,
          role: res.role
        });
      } else {
        setError(res.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to backend server. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-grid-pattern">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/25 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-card w-full max-w-md p-8 border-indigo-500/40 relative z-10 shadow-2xl space-y-6 glow-indigo">
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-full h-full rounded-2xl bg-slate-950 border border-white/20 flex items-center justify-center">
              <Mic className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          
          <h1 className="font-display text-3xl font-black gradient-text-primary tracking-tight">AI DEBATE COACH</h1>
          <p className="text-xs text-slate-400 font-medium">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 justify-center text-sm font-bold mt-2"
          >
            {loading ? "Authenticating..." : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={onNavigateRegister}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              Register Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
