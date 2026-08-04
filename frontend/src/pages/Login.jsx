import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Learner");
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignup) {
        const res = await axios.post("http://localhost:5000/signup", {
          name, email, password, role
        });

        if (res.data.success) {
          alert(res.data.message);
          setIsSignup(false);
        } else {
          alert(res.data.message);
        }

      } else {
        const res = await axios.post("http://localhost:5000/login", { email, password });

        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          const isNewLearner = res.data.user.role === "learner" && !res.data.user.onboardingCompleted;
          navigate(isNewLearner ? "/onboarding" : "/dashboard", { state: res.data.user });
        } else {
          alert(res.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAuth();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        <div className="bg-[#13131f] border border-white/5 rounded-2xl shadow-2xl p-8">

          <h2 className="text-2xl font-semibold text-white mb-1 text-center">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-gray-500 text-sm mb-8 text-center">
            {isSignup ? "Sign up and pick your role to get started." : "Log in to continue your training."}
          </p>

          <div className="space-y-4" onKeyDown={handleKeyDown}>

            {isSignup && (
              <div className="flex items-center gap-3 bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500 transition">
                <UserIcon />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
                />
              </div>
            )}

            {isSignup && (
              <div className="flex items-center gap-3 bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500 transition">
                <RoleIcon />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-100"
                >
                  <option className="bg-[#13131f]">Learner</option>
                  <option className="bg-[#13131f]">Debate Coach</option>
                  <option className="bg-[#13131f]">Educator</option>
                  <option className="bg-[#13131f]">Admin</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500 transition">
              <MailIcon />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
              />
            </div>

            {/* ✅ NEW — show/hide password toggle */}
            <div className="flex items-center gap-3 bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500 transition">
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-gray-500 hover:text-gray-300 shrink-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-white font-semibold py-3 rounded-xl mt-2"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Log In"}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6 text-center">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => setIsSignup(!isSignup)}
              className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
            >
              {isSignup ? "Log in" : "Create one"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function RoleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ✅ NEW — eye / eye-off icons for the password toggle
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

export default Login;
