import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { getProfile } from "../services/profileService";
import { toast, Toaster } from "react-hot-toast";
import { FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const response = await login(formData);

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      const profile = await getProfile();

      localStorage.setItem(
        "user",
        JSON.stringify(profile.data)
      );

      toast.success("Welcome Back!");

      toast.success("Welcome Back!");

const role = profile.data.role;

setTimeout(() => {

  if (role === "Debate Coach") {

    navigate("/coach/dashboard");

  } else if (role === "Learner") {

    navigate("/dashboard");

  } else if (role === "Educator") {

    navigate("/educator/dashboard");

  } else if (role === "Administrator") {

    navigate("/admin/dashboard");

  } else {

    navigate("/dashboard");

  }

}, 1200);
    } catch (err) {
      toast.error("Invalid Email or Password");
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

          <h1>
            Welcome Back
          </h1>

          <p>
            Continue improving your debating,
            public speaking and presentation skills
            with AI.
          </p>

        </div>

        <div className="auth-right">

          <div className="auth-card">

            <h2>Login</h2>

            <p>
              Sign in to your account
            </p>

            <form onSubmit={handleSubmit}>

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

              <button
                className="login-button"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Login"}
              </button>

            </form>

            <div className="divider">
              OR
            </div>

            <p className="bottom-text">

              Don't have an account?

              <Link to="/register">
                Register
              </Link>

            </p>

          </div>

        </div>

      </div>
    </>
  );
}

export default Login;