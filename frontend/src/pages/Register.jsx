import React, { useState } from 'react';
import { api } from '../services/api';
import { Mic, User, Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';

export const Register = ({ onNavigateLogin }) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        fullname,
        email,
        username,
        password
      });

      if (res.success) {
        alert("Registration successful! You can now log in.");
        onNavigateLogin();
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch (err) {
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="glass-card w-full max-w-md p-8 border-indigo-500/30 relative z-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-extrabold gradient-text">Create Account</h1>
          <p className="text-xs text-slate-400">Join AI Debate Coach to train public speaking & arguments</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="form-group mb-0">
            <label className="text-xs">Full Name</label>
            <input
              type="text"
              className="form-input py-2 text-xs"
              placeholder="e.g. Alex Morgan"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-0">
            <label className="text-xs">Email Address</label>
            <input
              type="email"
              className="form-input py-2 text-xs"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-0">
            <label className="text-xs">User ID / Username</label>
            <input
              type="text"
              className="form-input py-2 text-xs"
              placeholder="alexm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group mb-0">
              <label className="text-xs">Password</label>
              <input
                type="password"
                className="form-input py-2 text-xs"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-0">
              <label className="text-xs">Confirm Password</label>
              <input
                type="password"
                className="form-input py-2 text-xs"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 justify-center text-sm font-bold mt-3"
          >
            {loading ? "Registering..." : "Create Learner Account"}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Already registered?{' '}
            <button
              onClick={onNavigateLogin}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              Login Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
