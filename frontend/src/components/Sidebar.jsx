import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaComments,
  FaChartLine,
  FaLightbulb,
  FaGraduationCap,
  FaUsers,
  FaClipboardCheck,
  FaChalkboardTeacher,
  FaTrophy,
  FaRobot,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import "../styles/sidebar.css";

export default function Sidebar() {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  let menu = [];

  // ===========================
  // Learner
  // ===========================
  if (role === "Learner") {
    menu = [
      { path: "/learner", icon: <FaHome />, label: "Dashboard" },
      { path: "/debate-history", icon: <FaComments />, label: "Debate History" },
      { path: "/performance", icon: <FaChartLine />, label: "Performance" },
      { path: "/improvement-trends", icon: <FaChartLine />, label: "Improvement Trends" },
      { path: "/recommendations", icon: <FaLightbulb />, label: "Recommendations" },
      { path: "/coaching-insights", icon: <FaGraduationCap />, label: "Coaching Insights" },
    ];
  }

  // ===========================
  // Coach
  // ===========================
  else if (role === "Coach") {
    menu = [
      { path: "/coach", icon: <FaHome />, label: "Dashboard" },
      { path: "/students-progress", icon: <FaUsers />, label: "Students Progress" },
      { path: "/evaluations", icon: <FaClipboardCheck />, label: "Evaluations" },
      { path: "/skill-gap", icon: <FaChartLine />, label: "Skill Gap" },
      { path: "/coaching-recommendations", icon: <FaLightbulb />, label: "Recommendations" },
    ];
  }

  // ===========================
  // Educator
  // ===========================
  else if (role === "Educator") {
    menu = [
      { path: "/educator", icon: <FaHome />, label: "Dashboard" },
      { path: "/class-analytics", icon: <FaChalkboardTeacher />, label: "Class Analytics" },
      { path: "/student-rankings", icon: <FaTrophy />, label: "Student Rankings" },
      { path: "/debate-reports", icon: <FaComments />, label: "Debate Reports" },
      { path: "/presentation-reports", icon: <FaChartLine />, label: "Presentation Reports" },
    ];
  }

  // ===========================
  // Admin
  // ===========================
  else if (role === "Admin") {
    menu = [
      { path: "/admin", icon: <FaHome />, label: "Dashboard" },
      { path: "/users", icon: <FaUsers />, label: "Users" },
      { path: "/analytics", icon: <FaChartLine />, label: "Analytics" },
      { path: "/ai-models", icon: <FaRobot />, label: "AI Models" },
    ];
  }

  return (
    <div className="sidebar">

      <h2 className="logo">🧠 AI Debate Coach</h2>

      <p className="role">
        <strong>{username}</strong>
        <br />
        {role}
      </p>

      <nav>

        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? "active" : ""}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        <button
          className="logout-btn"
          onClick={logout}
        >
          <FaSignOutAlt />
          Logout
        </button>

      </nav>

    </div>
  );
}