import { FaBell, FaUserCircle } from "react-icons/fa";

function Navbar() {
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email") || "User";

  const getRoleBadge = () => {
    switch (role) {
      case "Learner":
        return {
          text: "Learner",
          color: "bg-green-100 text-green-700",
        };

      case "Debate Coach":
        return {
          text: "Debate Coach",
          color: "bg-blue-100 text-blue-700",
        };

      case "Educator":
        return {
          text: "Educator",
          color: "bg-purple-100 text-purple-700",
        };

      case "Administrator":
        return {
          text: "Administrator",
          color: "bg-red-100 text-red-700",
        };

      default:
        return {
          text: "User",
          color: "bg-gray-100 text-gray-700",
        };
    }
  };

  const badge = getRoleBadge();

  return (
    <div className="bg-white shadow flex justify-between items-center px-8 py-4">

      {/* Left */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, {badge.text} 👋
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          AI Debate Coach Platform
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button className="text-2xl text-gray-600 hover:text-green-700">
          <FaBell />
        </button>

        {/* Role Badge */}
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.color}`}
        >
          {badge.text}
        </span>

        {/* User */}
        <div className="flex items-center gap-3">

          <FaUserCircle
            size={40}
            className="text-green-700"
          />

          <div>
            <p className="font-semibold text-gray-800">
              {email}
            </p>

            <p className="text-sm text-gray-500">
              {role}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Navbar;