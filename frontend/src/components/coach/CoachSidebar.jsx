import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaCalendarAlt,
  FaRobot,
  FaSearch,
  FaExclamationTriangle,
  FaMicrophone,
  FaBook,
  FaChartBar,
  FaFileAlt,
  FaBullseye,
  FaEnvelope,
  FaBell,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  
} from "react-icons/fa";

import "../../styles/coachSidebar.css";

const menuClass = ({ isActive }) =>
  isActive ? "coach-link active" : "coach-link";

export default function CoachSidebar() {

  const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href = "/login";

    };



  return (
    <aside className="coach-sidebar">

      
        <div className="coach-logo">

    <h2>Debate Coach</h2>

    <p>AI Presentation Analysis</p>

</div>
        

      <h5>COACH PANEL</h5>

      <NavLink
    to="/coach/dashboard"
    className={menuClass}
>
    <FaHome />
    Dashboard
</NavLink>

      <h5>COACHING</h5>

      <NavLink to="/coach/learners" className={menuClass}>
        <FaUsers />
        Learners
      </NavLink>

      <NavLink to="/coach/assigned-debates" className={menuClass}>
        <FaClipboardList />
        Assigned Debates
      </NavLink>

      <NavLink to="/coach/debate-sessions" className={menuClass}>
        <FaCalendarAlt />
        Debate Sessions
      </NavLink>

      <NavLink
    to="/coach/ai-queue"
    className={menuClass}
>
    <FaRobot />
    AI Evaluation Queue
</NavLink>

      <NavLink to="/coach/argument-reviews" className={menuClass}>
        <FaSearch />
        Argument Reviews
      </NavLink>

      <NavLink to="/coach/fallacy-reports" className={menuClass}>
        <FaExclamationTriangle />
        Fallacy Reports
      </NavLink>

      <NavLink to="/coach/presentation-reviews" className={menuClass}>
        <FaMicrophone />
        Presentation Reviews
      </NavLink>

      <NavLink to="/coach/coaching-plans" className={menuClass}>
        <FaBook />
        Coaching Plans
      </NavLink>

      <h5>ANALYTICS</h5>

      <NavLink to="/coach/performance" className={menuClass}>
        <FaChartBar />
        Performance Analytics
      </NavLink>

      <NavLink to="/coach/reports" className={menuClass}>
        <FaFileAlt />
        Reports
      </NavLink>

      <NavLink to="/coach/skill-gap" className={menuClass}>
        <FaBullseye />
        Skill Gap Analysis
      </NavLink>

      <h5>COMMUNICATION</h5>

      <NavLink to="/coach/messages" className={menuClass}>
        <FaEnvelope />
        Messages
      </NavLink>

      <NavLink to="/coach/notifications" className={menuClass}>
        <FaBell />
        Notifications
      </NavLink>

      <h5>OTHER</h5>

      <NavLink to="/settings" className={menuClass}>
        <FaCog />
        Settings
      </NavLink>

      <NavLink to="/coach/help" className={menuClass}>
        <FaQuestionCircle />
        Help & Support
      </NavLink>

      <button
    className="coach-logout-btn"
    onClick={logout}
>

    <FaSignOutAlt />

    Logout

</button>




    </aside>
  );
}