import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Learner",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await api.post("/users/signup", formData);

      alert("Account Created Successfully!");

      navigate("/");
    }  catch (error) {
  console.log(error);

  if (error.response) {
    console.log(error.response.data);
    alert(error.response.data.detail);
  } else {
    alert(error.message);
  }
}
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center">

      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">

        <h1 className="text-4xl font-bold text-center text-green-700">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Join AI Debate Coach
        </p>

        <form onSubmit={handleSignup} className="space-y-5">

          <div>
            <label className="font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter your name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="font-medium">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
            >
              <option>Learner</option>
              <option>Debate Coach</option>
              <option>Educator</option>
              <option>Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition"
          >
            Create Account
          </button>

        </form>

        <p className="text-center mt-6">
          Already have an account?

          <Link
            to="/"
            className="text-green-700 font-semibold ml-2"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Signup;