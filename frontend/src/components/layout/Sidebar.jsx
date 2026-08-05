import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {

    FaHome,

    FaUser,

    FaComments,

    FaCalendarAlt,

    FaChartLine,

    FaChartBar,

    FaBell,

    FaCog,

    FaUsers,

    FaSignOutAlt,

    FaUserShield,

    FaGraduationCap

} from "react-icons/fa";

const Sidebar = () => {

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const role = user?.role;

    const dashboardRoute = {

        "Learner": "/learner/dashboard",

        "Debate Coach": "/coach/dashboard",

        "Educator": "/educator/dashboard",

        "Administrator": "/admin/dashboard"

    };
    const handleLogout = () => {

        logout();

        navigate("/login", { replace: true });

    };
    return (

        <aside className="sidebar">

            {/* ==========================================
                    Logo
            =========================================== */}

            <div className="sidebar-logo">

                <div className="logo-circle">

                    AI

                </div>

                <div>

                    <h2>Debate Coach</h2>

                    <span>Learning Platform</span>

                </div>

            </div>

            {/* ==========================================
                    Logged User
            =========================================== */}

            <div className="sidebar-user">

                <div className="avatar">

                    {user?.full_name?.charAt(0).toUpperCase() || "G"}

                </div>

                <div>

                    <h4>

                        {user?.full_name || "Guest"}

                    </h4>

                    <span>

                        {role}

                    </span>

                </div>

            </div>

            {/* ==========================================
                    Navigation
            =========================================== */}

            <nav className="sidebar-menu">

                <NavLink

                    to={dashboardRoute[role] || "/"}

                    className={({ isActive }) =>

                        isActive ? "active-link" : ""

                    }

                >

                    <FaHome />

                    Dashboard

                </NavLink>

                <NavLink

                    to="/profile"

                    className={({ isActive }) =>

                        isActive ? "active-link" : ""

                    }

                >

                    <FaUser />

                    Profile

                </NavLink>

                {/* ======================================
                        Learner
                ======================================= */}

                {

                    role === "Learner" &&

                    <>

                        <NavLink to="/topics">

                            <FaComments />

                            Debate Topics

                        </NavLink>

                        <NavLink to="/debate-sessions">

                            <FaCalendarAlt />

                            Debate Sessions

                        </NavLink>

                        <NavLink to="/skills">

                            <FaChartLine />

                            Skill Tracking

                        </NavLink>

                        <NavLink to="/reports">

                            <FaChartBar />

                            Reports

                        </NavLink>

                        <NavLink to="/notifications">

                            <FaBell />

                            Notifications

                        </NavLink>

                        <NavLink to="/settings">

                            <FaCog />

                            Settings

                        </NavLink>

                    </>

                }

                {/* ======================================
                        Debate Coach
                ======================================= */}

                {

                    role === "Debate Coach" &&

                    <>
                        <NavLink to="/topics">

                            <FaGraduationCap />

                            Topics

                        </NavLink>

                        <NavLink to="/debate-sessions">

                            <FaCalendarAlt />

                            Debate Sessions

                        </NavLink>

                        <NavLink to="/reports">

                            <FaChartBar />

                            Reports

                        </NavLink>

                    </>

                }

                {/* ======================================
                        Educator
                ======================================= */}

                {

                    role === "Educator" &&

                    <>

                        <NavLink to="/topics">

                            <FaGraduationCap />

                            Topics

                        </NavLink>

                        <NavLink to="/debate-sessions">

                            <FaCalendarAlt />

                            Debate Sessions

                        </NavLink>

                        <NavLink to="/reports">

                            <FaChartBar />

                            Reports

                        </NavLink>

                    </>

                }

                {/* ======================================
                        Administrator
                ======================================= */}

                {

                    role === "Administrator" &&

                    <>

                        <NavLink to="/topics">

                            <FaComments />

                            Manage Topics

                        </NavLink>

                        <NavLink to="/users">

                            <FaUsers />

                            Users

                        </NavLink>

                        <NavLink to="/debate-sessions">

                            <FaCalendarAlt />

                            Debate Sessions

                        </NavLink>

                        <NavLink to="/reports">

                            <FaUserShield />

                            System Reports

                        </NavLink>

                    </>

                }

            </nav>

            {/* ==========================================
                    Logout
            =========================================== */}

            <button

                className="logout-btn"

                onClick={handleLogout}
            >

                <FaSignOutAlt />

                Logout

            </button>

        </aside>

    );

};

export default Sidebar;