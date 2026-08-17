import {
    FaHome,
    FaTrophy,
    FaRobot,
    FaBook,
    FaBalanceScale,
    FaExclamationTriangle,
    FaComments,
    FaMicrophone,
    FaChartLine,
    FaStar,
    FaGraduationCap,
    FaStickyNote,
    FaBell,
    FaCog,
    FaUserTie,
    FaSignOutAlt,
    FaClipboardList,
    FaUsers,
    FaChalkboardTeacher,
    FaTasks,
    FaClipboardCheck,
    FaChartBar,
    FaBullseye,
    FaFolderOpen,
    FaBullhorn,
    FaEnvelope,
    FaQuestionCircle
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

import "../styles/sidebar.css";


function Sidebar() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );


    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";

    };


    const menuClass = ({ isActive }) =>
        isActive
            ? "sidebar-link active"
            : "sidebar-link";


    /* =========================================================
       EDUCATOR SIDEBAR
       ========================================================= */

    if (user?.role === "Educator") {

        return (

            <aside className="sidebar">

                {/* =================================================
                   LOGO
                   ================================================= */}

                <div className="sidebar-logo">

                    <div className="logo-circle">
                        🎤
                    </div>

                    <div>

                        <h2>
                            Debate Coach
                        </h2>

                        <p>
                            AI Presentation Analysis
                        </p>

                    </div>

                </div>


                {/* =================================================
                   OVERVIEW
                   ================================================= */}

                <h5 className="sidebar-title">
                    OVERVIEW
                </h5>


                <NavLink
                    to="/educator/dashboard"
                    className={menuClass}
                >

                    <FaHome />

                    Dashboard

                </NavLink>




                {/* =================================================
                   TEACHING
                   ================================================= */}

                <h5 className="sidebar-title">
                    TEACHING
                </h5>


                <NavLink
                    to="/educator/classes"
                    className={menuClass}
                >

                    <FaChalkboardTeacher />

                    My Classes

                </NavLink>


                <NavLink
                    to="/educator/learners"
                    className={menuClass}
                >

                    <FaUsers />

                    Learners

                </NavLink>


                <NavLink
                    to="/debate-sessions"
                    className={menuClass}
                >

                    <FaMicrophone />

                    Debate Sessions

                </NavLink>


                <NavLink
                    to="/educator/assignments"
                    className={menuClass}
                >

                    <FaTasks />

                    Assignments

                </NavLink>
                <NavLink
    to="/educator/announcements"
    className="sidebar-link"
>
    <FaBullhorn />
    <span>Announcements</span>
</NavLink>

                

<NavLink
    to="/educator/assignment-reviews"
    className="sidebar-link"
>
    <FaClipboardCheck />
    <span>Assignment Reviews</span>
</NavLink>


                {/* =================================================
                   ANALYTICS
                   ================================================= */}

                <h5 className="sidebar-title">
                    ANALYTICS
                </h5>


                <NavLink
                    to="/educator/class-analytics"
                    className={menuClass}
                >

                    <FaChartBar />

                    Class Analytics

                </NavLink>


                <NavLink
                    to="/educator/performance-reports"
                    className={menuClass}
                >

                    <FaChartLine />

                    Performance Reports

                </NavLink>


                <NavLink
                    to="/educator/presentation-reports"
                    className={menuClass}
                >

                    <FaChartLine />

                    Presentation Reports

                </NavLink>


                <NavLink
                    to="/educator/skill-gap"
                    className={menuClass}
                >

                    <FaBullseye />

                    Skill Gap Analysis

                </NavLink>


                {/* =================================================
                   CONTENT & TOOLS
                   ================================================= */}

                <h5 className="sidebar-title">
                    CONTENT & TOOLS
                </h5>


                <NavLink
                    to="/topics"
                    className={menuClass}
                >

                    <FaBook />

                    Practice Topics

                </NavLink>


                {/* =================================================
                   COMMUNICATION
                   ================================================= */}

                <h5 className="sidebar-title">
                    COMMUNICATION
                </h5>


                <NavLink
                    to="/notifications"
                    className={menuClass}
                >

                    <FaBullhorn />

                    Announcements

                </NavLink>


                {/* =================================================
                   OTHER
                   ================================================= */}

                <h5 className="sidebar-title">
                    OTHER
                </h5>


                <NavLink
                    to="/settings"
                    className={menuClass}
                >

                    <FaCog />

                    Settings

                </NavLink>


                <NavLink
                    to="/help"
                    className={menuClass}
                >

                    <FaQuestionCircle />

                    Help & Support

                </NavLink>


                <button
                    className="logout-btn-sidebar"
                    onClick={logout}
                >

                    <FaSignOutAlt />

                    Logout

                </button>

            </aside>

        );

    }


    /* =========================================================
       LEARNER / EXISTING SIDEBAR
       DO NOT CHANGE YOUR EXISTING LEARNER FEATURES
       ========================================================= */

    return (

        <aside className="sidebar">

            <div className="sidebar-logo">

                <div className="logo-circle">
                    🎤
                </div>

                <div>

                    <h2>
                        Debate Coach
                    </h2>

                    <p>
                        AI Presentation Analysis
                    </p>

                </div>

            </div>


            <NavLink
                to="/dashboard"
                className={menuClass}
            >

                <FaHome />

                Dashboard

            </NavLink>


            <h5 className="sidebar-title">
                LEARN
            </h5>


            <NavLink
                to="/assigned-debates"
                className={menuClass}
            >

                <FaClipboardList />

                Assigned Debates

            </NavLink>


            <NavLink
                to="/my-debates"
                className={menuClass}
            >

                <FaTrophy />

                My Debates

            </NavLink>


            <NavLink
                to="/sessions"
                className={menuClass}
            >

                <FaRobot />

                AI Debate Simulation

            </NavLink>


            <NavLink
                to="/topics"
                className={menuClass}
            >

                <FaBook />

                Practice Topics

            </NavLink>


            <NavLink
                to="/argument-analyzer"
                className={menuClass}
            >

                <FaBalanceScale />

                Argument Analyzer

            </NavLink>



            <NavLink
                to="/fallacy-detector"
                className={menuClass}
            >

                <FaExclamationTriangle />

                Fallacy Detector

            </NavLink>


            <NavLink
                to="/counterargument-generator"
                className={menuClass}
            >

                <FaComments />

                Counterargument Generator

            </NavLink>


            <NavLink
                to="/rebuttal-generator"
                className={menuClass}
            >

                <FaComments />

                Rebuttal Generator

            </NavLink>


            <NavLink
                to="/speech-improver"
                className={menuClass}
            >

                <FaMicrophone />

                Speech Improver

            </NavLink>


            <h5 className="sidebar-title">
                ANALYZE
            </h5>


            <NavLink
                to="/presentation-analysis"
                className={menuClass}
            >

                <FaMicrophone />

                Presentation Analysis

            </NavLink>

            <NavLink
    to="/my-assignments"
    className="sidebar-link"
>
    <FaTasks />
    <span>My Assignments</span>
</NavLink>


            <NavLink
                to="/reports"
                className={menuClass}
            >

                <FaChartLine />

                Performance Scores

            </NavLink>


            <h5 className="sidebar-title">
                IMPROVE
            </h5>


            <NavLink
                to="/ai-feedback"
                className={menuClass}
            >

                <FaRobot />

                Feedback & Coaching

            </NavLink>


            <NavLink
                to="/coach-feedback"
                className={menuClass}
            >

                <FaUserTie />

                Coach Feedback

            </NavLink>


            <NavLink
                to="/coaching-plans"
                className={menuClass}
            >

                <FaClipboardList />

                Coaching Plans

            </NavLink>


            <NavLink
                to="/recommended"
                className={menuClass}
            >

                <FaStar />

                Recommended For You

            </NavLink>


            <h5 className="sidebar-title">
                RESOURCES
            </h5>


            <NavLink
                to="/learning"
                className={menuClass}
            >

                <FaGraduationCap />

                Learning Resources

            </NavLink>


            <NavLink
                to="/notes"
                className={menuClass}
            >

                <FaStickyNote />

                My Notes

            </NavLink>


            <h5 className="sidebar-title">
                OTHER
            </h5>


            <NavLink
                to="/notifications"
                className={menuClass}
            >

                <FaBell />

                Notifications

            </NavLink>

            <NavLink
    to="/announcements"
    className="sidebar-link"
>
    <FaBullhorn />
    <span>Announcements</span>
</NavLink>


            <NavLink
                to="/settings"
                className={menuClass}
            >

                <FaCog />

                Settings

            </NavLink>


            <button
                className="logout-btn-sidebar"
                onClick={logout}
            >

                <FaSignOutAlt />

                Logout

            </button>

        </aside>

    );

}


export default Sidebar;