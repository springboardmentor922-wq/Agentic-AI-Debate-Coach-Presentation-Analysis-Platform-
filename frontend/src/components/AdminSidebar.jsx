import {
    FaHome,
    FaUsers,
    FaUserShield,
    FaChartBar,
    FaCalendarAlt,
    FaRobot,
    FaFileAlt,
    FaCreditCard,
    FaBell,
    FaCog,
    FaShieldAlt,
    FaPlug,
    FaDatabase,
    FaQuestionCircle,
    FaSignOutAlt,
    FaComments,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

function AdminSidebar() {

    const menuClass = ({ isActive }) =>
        isActive
            ? "admin-sidebar-link active"
            : "admin-sidebar-link";


    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href = "/login";

    };


    return (

        <aside className="admin-sidebar">


            {/* Logo */}

            <div className="admin-logo">

                <div className="admin-logo-icon">
                    🎤
                </div>

                <div>

                    <h2>
                        Debate Coach
                    </h2>

                    <p>
                        & Presentation Analysis
                    </p>

                </div>

            </div>



            {/* MAIN */}

            <h5 className="admin-sidebar-title">
                MAIN
            </h5>


            <NavLink
                to="/admin/dashboard"
                className={menuClass}
            >

                <FaHome />

                <span>
                    Dashboard
                </span>

            </NavLink>


            <NavLink
                to="/admin/users"
                className={menuClass}
            >

                <FaUsers />

                <span>
                    User Management
                </span>

                <span className="admin-arrow">
                    ›
                </span>

            </NavLink>


            <NavLink
                to="/admin/roles"
                className={menuClass}
            >

                <FaUserShield />

                <span>
                    Role & Permissions
                </span>

                <span className="admin-arrow">
                    ›
                </span>

            </NavLink>


            <NavLink
                to="/admin/analytics"
                className={menuClass}
            >

                <FaChartBar />

                <span>
                    System Analytics
                </span>

            </NavLink>


            <NavLink
                to="/admin/sessions"
                className={menuClass}
            >

                <FaCalendarAlt />

                <span>
                    Debate Sessions
                </span>

            </NavLink>


            <NavLink
                to="/admin/ai-services"
                className={menuClass}
            >

                <FaRobot />

                <span>
                    AI Models & Services
                </span>

            </NavLink>


            <NavLink
                to="/admin/content"
                className={menuClass}
            >

                <FaFileAlt />

                <span>
                    Content Management
                </span>

            </NavLink>


            <NavLink
                to="/admin/reports"
                className={menuClass}
            >

                <FaChartBar />

                <span>
                    Reports & Logs
                </span>

            </NavLink>


            <NavLink
                to="/admin/billing"
                className={menuClass}
            >

                <FaCreditCard />

                <span>
                    Subscriptions & Billing
                </span>

            </NavLink>


            <NavLink
                to="/admin/notifications"
                className={menuClass}
            >

                <FaBell />

                <span>
                    Notification Center
                </span>

            </NavLink>


            <NavLink
                to="/admin/support"
                className={menuClass}
            >

                <FaComments />

                <span>
                    Feedback & Support
                </span>

            </NavLink>



            {/* SYSTEM */}

            <h5 className="admin-sidebar-title">
                SYSTEM
            </h5>


            <NavLink
                to="/admin/settings"
                className={menuClass}
            >

                <FaCog />

                <span>
                    System Settings
                </span>

            </NavLink>


            <NavLink
                to="/admin/security"
                className={menuClass}
            >

                <FaShieldAlt />

                <span>
                    Security & Compliance
                </span>

            </NavLink>


            <NavLink
                to="/admin/integrations"
                className={menuClass}
            >

                <FaPlug />

                <span>
                    Integrations
                </span>

            </NavLink>


            <NavLink
                to="/admin/backup"
                className={menuClass}
            >

                <FaDatabase />

                <span>
                    Backup & Recovery
                </span>

            </NavLink>



            {/* OTHER */}

            <h5 className="admin-sidebar-title">
                OTHER
            </h5>


            <NavLink
                to="/admin/audit"
                className={menuClass}
            >

                <FaFileAlt />

                <span>
                    Audit Logs
                </span>

            </NavLink>


            <NavLink
                to="/admin/help"
                className={menuClass}
            >

                <FaQuestionCircle />

                <span>
                    Help & Support
                </span>

            </NavLink>



            {/* Logout */}

            <button
                className="admin-logout"
                onClick={logout}
            >

                <FaSignOutAlt />

                <span>
                    Logout
                </span>

            </button>


        </aside>

    );

}

export default AdminSidebar;