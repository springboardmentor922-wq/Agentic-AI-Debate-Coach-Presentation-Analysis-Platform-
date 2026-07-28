import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaComments,
  FaUpload,
  FaSignOutAlt,
} from "react-icons/fa";

import "../styles/sidebar.css";

export default function Sidebar() {
  const role = localStorage.getItem("role");
  const location = useLocation();

  return (
    <div className="sidebar">

      <h2 className="logo">AI Debate Coach</h2>

      <p className="role">
        <strong>Role:</strong> {role}
      </p>

      <nav>

        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          <FaHome /> Dashboard
        </Link>

        <Link
          to="/profile"
          className={location.pathname === "/profile" ? "active" : ""}
        >
          <FaUser /> Profile
        </Link>

        <Link
          to="/sessions"
          className={location.pathname === "/sessions" ? "active" : ""}
        >
          <FaComments /> Debate Sessions
        </Link>

        <Link
          to="/upload"
          className={location.pathname === "/upload" ? "active" : ""}
        >
          <FaUpload /> Upload
        </Link>

        <Link to="/">
          <FaSignOutAlt /> Logout
        </Link>

      </nav>

    </div>
  );
}