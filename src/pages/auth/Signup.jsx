import { Link } from "react-router-dom";

function Signup() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-10">

        <h1 className="text-4xl font-bold text-green-700 text-center">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Join AI Debate Coach
        </p>

        <form className="space-y-5">

          <div>
            <label className="font-medium">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="font-medium">Password</label>
            <input
              type="password"
              placeholder="Create password"
              className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
              <label className="font-medium">Role</label>

              <select
                className="mt-2 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none"
              >
                <option>Learner</option>
                <option>Debate Coach</option>
                <option>Educator</option>
                <option>Administrator</option>
              </select>
            </div>

          <button
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold"
          >
            Create Account
          </button>

        </form>

        <p className="text-center mt-8">
          Already have an account?

          <Link
            to="/"
            className="ml-2 text-green-700 font-semibold"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Signup;