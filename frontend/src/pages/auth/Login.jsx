import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(email, password);
        localStorage.setItem("token", response.access_token);
      const decoded = jwtDecode(response.access_token);
      localStorage.setItem("role_id", decoded.role_id);
      toast.success("Login Successful");   

      switch (decoded.role_id) {
        case 1:
          navigate("/learner/dashboard");
          break;
        case 2:
          navigate("/coach/dashboard");
          break;
        case 3:
          navigate("/educator/dashboard");
          break;
        case 4:
          navigate("/admin/dashboard");
          break;
        default:
          toast.error("Invalid Role");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Agentic AI Debate Coach
        </h1>

        <p className="text-center text-slate-500 mt-2">
          Welcome Back 👋
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label>Email</label>

            <input
              type="email"
              className="w-full border rounded-lg px-4 py-3 mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Password</label>

            <input
              type="password"
              className="w-full border rounded-lg px-4 py-3 mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;