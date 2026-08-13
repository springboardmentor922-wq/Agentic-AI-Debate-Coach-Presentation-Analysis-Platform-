import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FaBell, FaSearch, FaCog, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search topics, sessions, reports..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                                navigate(`/topics?search=${encodeURIComponent(e.target.value.trim())}`);
                            }
                        }}
                    />
                </div>
            </div>

            <div className="navbar-right">
                <div className="current-date">
                    {today}
                </div>

                <button type="button" className="icon-btn" onClick={() => navigate("/notifications")} title="Notifications">
                    <FaBell />
                </button>

                <button type="button" className="icon-btn" onClick={() => navigate("/settings")} title="Settings">
                    <FaCog />
                </button>

                <div className="profile-box" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }} title="View Profile">
                    <div className="navbar-avatar">
                        {user?.full_name?.charAt(0)?.toUpperCase() || "G"}
                    </div>

                    <div className="profile-info">
                        <h4>
                            {user?.full_name || "Guest"}
                        </h4>

                        <span>
                            {user?.role || ""}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="logout-icon"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <FaSignOutAlt />
                </button>
            </div>
        </header>
    );
};

export default Navbar;