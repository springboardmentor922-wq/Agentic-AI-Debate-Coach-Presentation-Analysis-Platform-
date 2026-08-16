import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaComments,
  FaUsers,
  FaClipboardCheck,
  FaChartBar,
  FaChartLine,
  FaBook,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaRobot,
  FaLightbulb,
  FaBalanceScale,
  FaMagic,
  FaRegCommentDots,
  FaStar,
  FaRegBell,
} from "react-icons/fa";
import api from "../services/api";

function Sidebar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const logout = async () => {
    if (role === "Administrator") {
      try { await api.post("/users/admin-logout"); } catch { /* local state is still cleared */ }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    sessionStorage.removeItem("adminAuthenticated");
    navigate("/");
  };

  if (role === "Learner") {
    const learnerLinks = [
      ["Dashboard", "/learner", FaHome, true],
      ["My Debates", "/learner/history", FaComments],
      ["AI Debate Simulation", "/debate?mode=simulation", FaRobot],
      ["Practice Topics", "/debate?mode=topics", FaLightbulb],
      ["Argument Analyzer", "/learner/analyze?tool=analysis", FaBalanceScale],
      ["Fallacy Detector", "/learner/analyze?tool=fallacy", FaMagic],
      ["Counterargument Generator", "/learner/analyze?tool=counterargument", FaRegCommentDots],
      ["Presentation Analysis", "/learner/analyze?tool=feedback", FaChartBar],
      ["Performance Scores", "/learner/history?view=scores", FaChartLine],
      ["Feedback & Coaching", "/learner/history?view=feedback", FaRegCommentDots],
      ["Recommended For You", "/debate?mode=recommended", FaStar],
      ["Learning Resources", "/learner/analyze?tool=resources", FaBook],
      ["My Notes", "/profile", FaBook],
    ];
    const groups = [["LEARN", learnerLinks.slice(1, 7)], ["ANALYZE", learnerLinks.slice(7, 9)], ["IMPROVE", learnerLinks.slice(9, 11)], ["RESOURCES", learnerLinks.slice(11)]];
    return <aside className="min-h-screen w-64 shrink-0 bg-gradient-to-b from-[#111b38] to-[#102b61] px-3 py-4 text-white shadow-xl">
      <Link to="/learner" className="flex items-center gap-3 px-3 pb-5"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-violet-400 bg-violet-600 text-xl"><FaRegCommentDots /></span><span><span className="block text-base font-bold leading-none">DebateForge</span><span className="mt-1 block text-[10px] text-slate-300">AI debate &amp; presentation lab</span></span></Link>
      <SideLink item={learnerLinks[0]} />
      {groups.map(([title, links]) => <div key={title} className="mt-5"><p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400">{title}</p>{links.map((item) => <SideLink key={`${item[0]}-${item[1]}`} item={item} />)}</div>)}
      <div className="mt-5 border-t border-white/10 pt-4"><button onClick={() => alert("No new notifications.")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-white/10"><span className="relative"><FaRegBell /><span className="absolute -right-2 -top-2 grid h-3.5 w-3.5 place-items-center rounded-full bg-rose-500 text-[8px]">1</span></span>Notifications</button><Link to="/profile" className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"><FaCog /> Settings</Link><button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-white/10"><FaSignOutAlt /> Logout</button></div>
    </aside>;
  }

  const workspace = {
    "Debate Coach": [
      ["Dashboard", "/coach", FaHome, true], ["Learners", "/coach?section=learners", FaUsers], ["Assigned Debates", "/coach?section=assigned-debates", FaClipboardCheck], ["Debate Sessions", "/coach?section=sessions", FaComments], ["AI Evaluation Queue", "/coach?section=evaluations", FaClipboardCheck], ["Argument Reviews", "/coach?section=arguments", FaBalanceScale], ["Fallacy Reports", "/coach?section=fallacies", FaMagic], ["Presentation Reviews", "/coach?section=presentations", FaChartBar], ["Coaching Plans", "/coach?section=plans", FaStar], ["Performance Analytics", "/coach?section=analytics", FaChartLine], ["Reports", "/coach?section=reports", FaBook], ["Messages", "/coach?section=messages", FaRegCommentDots], ["Notifications", "/coach?section=notifications", FaRegBell],
    ],
    Educator: [
      ["Dashboard", "/educator", FaHome, true], ["Class Progress", "/educator?section=progress", FaUsers], ["Students", "/educator?section=students", FaUsers], ["Debate Topics", "/educator?section=topics", FaBook], ["Practice Sessions", "/educator?section=sessions", FaComments], ["Assignments", "/educator?section=assignments", FaClipboardCheck], ["Performance Scores", "/educator?section=performance", FaChartLine], ["Class Reports", "/educator?section=reports", FaChartBar], ["Learning Resources", "/educator?section=resources", FaBook], ["Notifications", "/educator?section=notifications", FaRegBell],
    ],
    Administrator: [
      ["Dashboard", "/admin", FaHome, true], ["User Management", "/admin?section=users", FaUsers], ["Role & Permissions", "/admin?section=roles", FaUser], ["System Analytics", "/admin?section=analytics", FaChartBar], ["Debate Sessions", "/admin?section=sessions", FaComments], ["AI Models & Services", "/admin?section=ai-services", FaRobot], ["Content Management", "/admin?section=content", FaBook], ["Reports & Logs", "/admin?section=reports", FaClipboardCheck], ["Subscriptions & Billing", "/admin?section=billing", FaChartLine], ["Notification Center", "/admin?section=notifications", FaRegBell], ["System Settings", "/admin?section=settings", FaCog], ["Security & Compliance", "/admin?section=security", FaMagic], ["Integrations", "/admin?section=integrations", FaBalanceScale], ["Backup & Recovery", "/admin?section=backup", FaStar],
    ],
  }[role];

  if (workspace) {
    return <aside className="min-h-screen w-64 shrink-0 bg-gradient-to-b from-[#111b38] to-[#102b61] px-3 py-4 text-white shadow-xl"><Link to={workspace[0][1]} className="flex items-center gap-3 px-3 pb-6"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-violet-400 bg-violet-600 text-xl"><FaRegCommentDots /></span><span><span className="block text-base font-bold">DebateForge</span><span className="block text-[10px] text-slate-300">{role} workspace</span></span></Link><nav><p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400">WORKSPACE</p>{workspace.map((item) => <SideLink key={item[0]} item={item} />)}</nav><div className="mt-6 border-t border-white/10 pt-4"><button onClick={() => window.alert("No new notifications.")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-white/10"><FaRegBell /> Notifications</button><button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-white/10"><FaSignOutAlt /> Logout</button></div></aside>;
  }

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-[#111b38] to-[#102b61] text-white shadow-xl">
      {/* Logo */}
      <div className="border-b border-white/10 p-6 text-3xl font-bold">
        DebateForge
      </div>

      <nav className="mt-6">

        {/* ================= LEARNER ================= */}
        {role === "Learner" && (
          <>
            <Link
              to="/learner"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaHome />
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaUser />
              My Profile
            </Link>

            <Link
              to="/debate"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaComments />
              Debate session
            </Link>

            <Link
              to="/learner/history"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaChartBar />
              Analysis history
            </Link>
          </>
        )}

        {/* ================= COACH ================= */}
        {role === "Debate Coach" && (
          <>
            <Link
              to="/coach"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaHome />
              Dashboard
            </Link>

            <Link
              to="/learners"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaUsers />
              Learners
            </Link>

            <Link
              to="/reviews"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaClipboardCheck />
              Reviews
            </Link>

            <Link
              to="/analytics"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
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
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaHome />
              Dashboard
            </Link>

            <Link
              to="/students"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaUsers />
              Students
            </Link>

            <Link
              to="/topics"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
            >
              <FaBook />
              Debate Topics
            </Link>

            <Link
              to="/reports"
              className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
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
      className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
    >
      <FaHome />
      Dashboard
    </Link>

    <Link
      to="/admin/profile"
      className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
    >
      <FaUser />
      Profile
    </Link>

    <Link
      to="/users"
      className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
    >
      <FaUsers />
      Manage Users
    </Link>

    <Link
      to="/roles"
      className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
    >
      <FaUser />
      Manage Roles
    </Link>

    <Link
      to="/settings"
      className="flex items-center gap-3 px-6 py-4 hover:bg-white/10"
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

function SideLink({ item: [label, to, Icon, exact] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pagePath = to.includes("?section=") ? `${to.split("?section=")[0]}/${to.split("?section=")[1]}` : to;
  const active = location.pathname === pagePath || (exact && location.pathname === to && !location.search);
  return <NavLink end={exact} to={pagePath} onClick={(event) => { if (to.includes("?section=")) { event.preventDefault(); navigate(pagePath); } }} className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${active ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/30" : "text-slate-200 hover:bg-white/10 hover:text-white"}`}><Icon className="text-sm" />{label}{label === "Dashboard" && <FaChevronLeft className="ml-auto rotate-180 text-[9px]" />}</NavLink>;
}

export default Sidebar;
