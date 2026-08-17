import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { toast, Toaster } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserGraduate,
  FaArrowLeft,
} from "react-icons/fa";

import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Learner",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await register(formData);

      toast.success("Registration Successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      toast.error("Registration Failed");
    }

    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="auth-page">

        <div className="auth-left">

          <Link to="/" className="back-home">
            <FaArrowLeft />
            Back
          </Link>

          <h1>Create Account</h1>

          <p>
            Join the Agentic AI Debate Coach platform and
            improve your debating, reasoning, communication
            and presentation skills.
          </p>

        </div>

        <div className="auth-right">

          <div className="auth-card">

            <h2>Register</h2>

            <p>Create your account</p>

            <form onSubmit={handleSubmit}>

              <div className="input-group">
                <FaUser />
                <input
                  type="text"
                  placeholder="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <FaEnvelope />
                <input
                  type="email"
                  placeholder="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <FaUserGraduate />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option>Learner</option>
                  <option>Debate Coach</option>
                  <option>Educator</option>
                  <option>Administrator</option>
                </select>
              </div>

              <button
                className="login-button"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

            </form>

            <div className="divider">
              OR
            </div>

            <p className="bottom-text">
              Already have an account?

              <Link to="/login">
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>
    </>
  );
}

export default Register;