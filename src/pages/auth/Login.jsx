import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBrain, FaChartLine, FaComments } from "react-icons/fa";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      // Store user information
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("email", email);

      // Redirect based on role
      switch (response.data.role) {
        case "Learner":
          navigate("/learner");
          break;

        case "Debate Coach":
          navigate("/coach");
          break;

        case "Educator":
          navigate("/educator");
          break;

        case "Administrator":
          navigate("/admin");
          break;

        default:
          navigate("/");
      }
    } catch (error) {
      console.error(error);

      alert("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] flex">
      {/* Left Section */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#111b38] via-[#182b5a] to-violet-800 text-white lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[38px] border-violet-300/20" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-violet-500/20" />
        <h1 className="text-5xl font-bold mb-5">
          DebateForge
        </h1>

        <p className="mb-12 text-xl text-violet-100">
          Your AI-powered space to build arguments, speak with confidence,
          and grow through every debate.
        </p>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <FaBrain size={30} />

            <div>
              <h3 className="font-semibold text-xl">
                AI Argument Analysis
              </h3>

              <p className="text-violet-100">
                Analyze claims and reasoning instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FaComments size={30} />

            <div>
              <h3 className="font-semibold text-xl">
                Debate Simulation
              </h3>

              <p className="text-violet-100">
                Practice against an intelligent AI opponent.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FaChartLine size={30} />

            <div>
              <h3 className="font-semibold text-xl">
                Performance Analytics
              </h3>

              <p className="text-violet-100">
                Track your improvement after every debate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-10 shadow-xl shadow-slate-200/70">
          <h2 className="text-4xl font-bold text-gray-800">
            Welcome Back
          </h2>

          <p className="text-gray-500 mt-2 mb-8">
            Sign in to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-medium">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-medium">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 cursor-pointer"
            >
              Login
            </button>
          </form>

          <p className="text-center mt-8">
            Don't have an account?

            <Link
              to="/signup"
              className="ml-2 font-semibold text-violet-700"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
