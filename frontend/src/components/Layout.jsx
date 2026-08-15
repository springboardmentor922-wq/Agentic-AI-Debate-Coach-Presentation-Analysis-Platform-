import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUser } from "../utils/useAuth";
import AIChatbotWidget from "./AIChatbotWidget";
import api from "../api/axios";

const NAV_BY_ROLE = {
  learner: [
    { label: "LEARN", items: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/my-debates", label: "My Debates" },
      { to: "/ai-debate-simulation", label: "AI Debate Simulation" },
      { to: "/phased-debate", label: "Phased Debate" },
      { to: "/topics", label: "Practice Topics" },
      { to: "/tools/argument-analyzer", label: "Argument Analyzer" },
      { to: "/tools/fallacy-detector", label: "Fallacy Detector" },
      { to: "/tools/counterargument-generator", label: "Counterargument Generator" },
    ]},
    { label: "ANALYZE", items: [
      { to: "/presentation-analysis", label: "Presentation Analysis" },
      { to: "/my-presentations", label: "My Presentations" },
      { to: "/performance-scores", label: "Performance Scores" },
    ]},
    { label: "IMPROVE", items: [
      { to: "/learning-path", label: "Learning Path" },
      { to: "/feedback-coaching", label: "Feedback & Coaching" },
      { to: "/recommended-for-you", label: "Recommended For You" },
    ]},
    { label: "RESOURCES", items: [
      { to: "/learning-resources", label: "Learning Resources" },
      { to: "/my-notes", label: "My Notes" },
    ]},
    { label: "OTHER", items: [
      { to: "/notifications", label: "Notifications", badgeKey: "notifications" },
      { to: "/settings", label: "Settings" },
      { to: "/help-support", label: "Help & Support" },
      { to: "/profile", label: "Profile" },
    ]},
  ],

  "debate coach": [
    { label: "COACHING", items: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/coach/learners", label: "Learners" },
      { to: "/reports", label: "Argument Reviews" },
      { to: "/coach/fallacy-reports", label: "Fallacy Reports" },
      { to: "/coach/presentation-reviews", label: "Presentation Reviews" },
      { to: "/coaching-plans", label: "Coaching Plans" },
    ]},
    { label: "ANALYZE", items: [
      { to: "/coach/performance-analytics", label: "Performance Analytics" },
      { to: "/reports", label: "Reports" },
      { to: "/coach/skill-gap-analysis", label: "Skill Gap Analysis" },
    ]},
    { label: "OTHER", items: [
      { to: "/coach/notifications", label: "Notifications", badgeKey: "notifications" },
      { to: "/settings", label: "Settings" },
      { to: "/help-support", label: "Help & Support" },
      { to: "/profile", label: "Profile" },
    ]},
  ],

  educator: [
    { label: "TEACHING", items: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/educator/classes", label: "My Classes" },
      { to: "/educator/learners", label: "Learners" },
      { to: "/educator/assignments", label: "Assignments" },
      { to: "/educator/evaluation-queue", label: "Evaluation Queue" },
    ]},
    { label: "ANALYTICS", items: [
      { to: "/educator/class-analytics", label: "Class Analytics" },
      { to: "/reports", label: "Performance Reports" },
      { to: "/educator/presentation-reports", label: "Presentation Reports" },
      { to: "/educator/skill-gap-analysis", label: "Skill Gap Analysis" },
    ]},
    { label: "CONTENT & TOOLS", items: [
      { to: "/topics", label: "Practice Topics" },
      { to: "/debate-formats", label: "Debate Formats" },
      { to: "/educator/rubrics", label: "Rubrics & Criteria" },
      { to: "/educator/resources", label: "Resource Library" },
      { to: "/educator/knowledge-base", label: "Knowledge Base (RAG)" },
    ]},
    { label: "COMMUNICATION", items: [
      { to: "/educator/announcements", label: "Announcements" },
    ]},
    { label: "OTHER", items: [
      { to: "/educator/notifications", label: "Notifications", badgeKey: "notifications" },
      { to: "/settings", label: "Settings" },
      { to: "/help-support", label: "Help & Support" },
      { to: "/profile", label: "Profile" },
    ]},
  ],

  admin: [
    { label: "MAIN", items: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/admin/users", label: "User Management" },
      { to: "/topics", label: "Practice Topics" },
      { to: "/admin/role-permissions", label: "Role & Permissions" },
      { to: "/admin/top-active-debates", label: "Debate Sessions" },
      { to: "/admin/ai-service-usage", label: "AI Models & Services" },
      { to: "/admin/content-management", label: "Content Management" },
      { to: "/reports", label: "Reports & Logs" },
      { to: "/admin/notification-center", label: "Notification Center" },
      { to: "/admin/support-tickets", label: "Feedback & Support" },
    ]},
    { label: "SYSTEM", items: [
      { to: "/admin/system-health", label: "System Settings" },
      { to: "/admin/security-compliance", label: "Security & Compliance" },
    ]},
    { label: "OTHER", items: [
      { to: "/admin/audit-logs", label: "Audit Logs" },
      { to: "/help-support", label: "Help & Support" },
      { to: "/profile", label: "Profile" },
    ]},
  ],
};

function Layout({ children }) {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role?.toLowerCase();
  const groups = NAV_BY_ROLE[role] || NAV_BY_ROLE.learner;
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (role === "learner") {
      api.get("/learner/notifications").then((res) => setNotificationCount(res.data.length)).catch(() => {});
    } else if (role === "debate coach") {
      api.get("/coach/notifications").then((res) => setNotificationCount(res.data.length)).catch(() => {});
    } else if (role === "educator") {
      api.get("/educator/notifications").then((res) => setNotificationCount(res.data.length)).catch(() => {});
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-[#0f0f1a] text-gray-100">

      <aside className="w-64 shrink-0 bg-[#13131f] border-r border-white/5 px-6 py-8 flex flex-col overflow-y-auto">
        <h1 className="text-xl font-bold text-purple-400 tracking-wide mb-8">
          AI Debate Coach
        </h1>

        <nav className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-gray-600 text-xs font-semibold tracking-wider mb-2 px-4">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    {item.badgeKey === "notifications" && notificationCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold">AI Debate Coach</h2>
            <p className="text-gray-500 text-sm">Train. Debate. Improve.</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-400 hidden sm:inline">
                {user.name} · <span className="capitalize">{user.role}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <AIChatbotWidget />
    </div>
  );
}

export default Layout;
