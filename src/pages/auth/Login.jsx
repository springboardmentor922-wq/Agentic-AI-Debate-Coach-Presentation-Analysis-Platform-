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

      // Save JWT token
      localStorage.setItem("token", response.data.access_token);

      // Save user role
      localStorage.setItem("role", response.data.role);

      console.log(response.data);
      alert("Role = " + response.data.role);

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
      alert("Invalid Email or Password");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 bg-green-700 text-white flex-col justify-center px-16">
        <h1 className="text-5xl font-bold mb-5">
          AI Debate Coach
        </h1>

        <p className="text-xl text-green-100 mb-12">
          Improve your communication, critical thinking and presentation skills with AI.
        </p>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <FaBrain size={30}/>
            <div>
              <h3 className="font-semibold text-xl">AI Argument Analysis</h3>
              <p className="text-green-100">
                Analyze claims and reasoning instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FaComments size={30}/>
            <div>
              <h3 className="font-semibold text-xl">Debate Simulation</h3>
              <p className="text-green-100">
                Practice against an intelligent AI opponent.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FaChartLine size={30}/>
            <div>
              <h3 className="font-semibold text-xl">Performance Analytics</h3>
              <p className="text-green-100">
                Track your improvement after every debate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-10">

          <h2 className="text-4xl font-bold text-gray-800">
            Welcome Back
          </h2>

          <p className="text-gray-500 mt-2 mb-8">
            Sign in to continue
          </p>

          <form className="space-y-5" onSubmit={handleLogin}>

            <div>
              <label className="font-medium">Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="font-medium">Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition"
            >
              Login
            </button>

          </form>

          <p className="text-center mt-8">
            Don't have an account?

            <Link
              to="/signup"
              className="text-green-700 font-semibold ml-2"
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