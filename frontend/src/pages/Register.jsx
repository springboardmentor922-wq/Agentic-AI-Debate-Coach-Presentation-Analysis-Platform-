import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

import "./styles/Register.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch =
    form.confirm_password.length > 0 && form.password === form.confirm_password;

  const passwordsMismatch =
    form.confirm_password.length > 0 && form.password !== form.confirm_password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        ...form,
        role: "learner",
      });

      navigate("/verify-email", {
        state: {
          email: data.email,
          otpExpiresInMinutes: data.otp_expires_in_minutes,
          devOtpCode: data.dev_otp_code,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-grid"></div>
      <div className="register-glow glow-left"></div>
      <div className="register-glow glow-right"></div>

      <div className="register-container">
        {/* LEFT SIDE */}

        <div className="register-left">
          <div className="brand-pill">
            <BrainCircuit size={18} />
            <span>Powered by Agentic AI</span>
          </div>

          <h1>
            Join the Future of
            <span> AI Debate Coaching</span>
          </h1>

          <p>
            Improve your debate, communication, presentation, reasoning and
            critical thinking with intelligent AI coaching designed for
            students, educators and professionals.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <Sparkles size={18} />
              </div>

              <div>
                <h3>Personalized AI Coaching</h3>
                <p>
                  Get feedback specially designed for your speaking and debating
                  style.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <BrainCircuit size={18} />
              </div>

              <div>
                <h3>Real-Time Argument Analysis</h3>
                <p>
                  Analyze claims, evidence, reasoning and logical fallacies
                  instantly.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <h3>Trusted by Universities</h3>
                <p>
                  Built for learners, debate coaches, educators and
                  institutions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="register-card">
          <h2>Create Account</h2>

          <p className="register-subtitle">
            Create your learner account and begin your AI Debate journey.
          </p>

          {error && <div className="register-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}

            <div className="input-group">
              <User size={18} className="input-icon" />

              <input
                type="text"
                placeholder="Full Name"
                required
                value={form.full_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    full_name: e.target.value,
                  })
                }
              />
            </div>

            {/* Email */}

            <div className="input-group">
              <Mail size={18} className="input-icon" />

              <input
                type="email"
                placeholder="Email Address"
                required
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
                placeholder="Password"
                minLength={6}
                required
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />
            </div>

            {/* Confirm Password */}

            <div className="input-group">
              <Lock size={18} className="input-icon" />

              <input
                type="password"
                placeholder="Confirm Password"
                minLength={6}
                required
                value={form.confirm_password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirm_password: e.target.value,
                  })
                }
              />

              {passwordsMatch && (
                <CheckCircle2 size={18} className="password-status success" />
              )}

              {passwordsMismatch && (
                <XCircle size={18} className="password-status error" />
              )}
            </div>

            {passwordsMismatch && (
              <p className="password-error">Passwords do not match.</p>
            )}

            <button
              type="submit"
              disabled={loading || passwordsMismatch}
              className="register-btn"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <GoogleSignInButton onError={setError} />

          <p className="login-link">
            Already have an account?
            <Link to="/learner/login"> Sign In</Link>
          </p>

          <p className="role-link">
            Debate Coach, Educator or Administrator?
            <Link to="/login"> Role Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
