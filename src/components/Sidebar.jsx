import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaComments,
  FaUsers,
  FaClipboardCheck,
  FaChartBar,
  FaBook,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="w-64 min-h-screen bg-green-700 text-white shadow-lg">
      {/* Logo */}
      <div className="text-3xl font-bold p-6 border-b border-green-600">
        Debate AI
      </div>

      <nav className="mt-6">

        {/* ================= LEARNER ================= */}
        {role === "Learner" && (
          <>
            <Link
              to="/learner"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaHome />
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaUser />
              My Profile
            </Link>

            <Link
              to="/debate"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaComments />
              Start Debate
            </Link>

            <Link
              to="/progress"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaChartBar />
              My Progress
            </Link>
          </>
        )}

        {/* ================= COACH ================= */}
        {role === "Debate Coach" && (
          <>
            <Link
              to="/coach"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaHome />
              Dashboard
            </Link>

            <Link
              to="/learners"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaUsers />
              Learners
            </Link>

            <Link
              to="/reviews"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaClipboardCheck />
              Reviews
            </Link>

            <Link
              to="/analytics"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaChartBar />
              Analytics
            </Link>
          </>
        )}

        {/* ================= EDUCATOR ================= */}
        {role === "Educator" && (
          <>
            <Link
              to="/educator"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaHome />
              Dashboard
            </Link>

            <Link
              to="/students"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaUsers />
              Students
            </Link>

            <Link
              to="/topics"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaBook />
              Debate Topics
            </Link>

            <Link
              to="/reports"
              className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
            >
              <FaChartBar />
              Reports
            </Link>
          </>
        )}

        {/* ================= ADMIN ================= */}
       {role === "Administrator" && (
  <>
    <Link
      to="/admin"
      className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
    >
      <FaHome />
      Dashboard
    </Link>

    <Link
      to="/admin/profile"
      className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
    >
      <FaUser />
      Profile
    </Link>

    <Link
      to="/users"
      className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
    >
      <FaUsers />
      Manage Users
    </Link>

    <Link
      to="/roles"
      className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
    >
      <FaUser />
      Manage Roles
    </Link>

    <Link
      to="/settings"
      className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
    >
      <FaCog />
      Settings
    </Link>
  </>
)}
        {/* ================= LOGOUT ================= */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-600 mt-8 text-left"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;