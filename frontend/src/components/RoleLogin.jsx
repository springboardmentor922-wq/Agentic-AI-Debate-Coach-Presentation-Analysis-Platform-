import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { BrainCircuit, Mail, Lock } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "./GoogleSignInButton";

import "./styles/RoleLogin.css";

export default function RoleLogin({
  role,
  roleLabel,
  icon: Icon,
  homePath,
  registerPath,
  otherPortals = [],
}) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ==========================================
     Backend Logic (UNCHANGED)
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await login(form.email, form.password, role);

      navigate(homePath);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-login-page">
      {/* Background */}

      <div className="login-grid"></div>

      <div className="login-glow glow-left"></div>

      <div className="login-glow glow-right"></div>

      {/* Card */}

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* AI Badge */}

        <motion.div
          className="login-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BrainCircuit size={18} />

          <span>Powered by Agentic AI</span>
        </motion.div>

        {/* Role Icon */}

        <div className="login-role-icon">
          <Icon size={34} />
        </div>

        {/* Heading */}

        <h1>Welcome Back</h1>

        <h2>{roleLabel} Portal</h2>

        <p className="login-subtitle">
          Sign in to continue your AI Debate journey.
        </p>

        {/* Error */}

        {error && <div className="login-error">{error}</div>}

        {/* Form */}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}

          <div className="input-group">
            <Mail size={18} className="input-icon" />

            <input
              type="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>

          {/* Password */}

          <div className="input-group">
            <Lock size={18} className="input-icon" />

            <input
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>

          {/* Remember + Forgot */}

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#">Forgot Password?</a>
          </div>

          {/* Sign In Button */}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Signing In..." : "Sign In"}
          </button>
          {/* Learner Google Login */}

          {role === "learner" && (
            <>
              <div className="login-divider">
                <span>OR</span>
              </div>

              <GoogleSignInButton onError={setError} />
            </>
          )}

          {/* Create Account */}

          {registerPath && (
            <p className="register-link">
              New here?
              <Link to={registerPath}> Create Account</Link>
            </p>
          )}

          {/* Choose Another Role */}

          {otherPortals.length > 0 && (
            <p className="other-role-link">
              Not a {roleLabel.toLowerCase()}?
              <Link to="/login"> Choose another role</Link>
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
