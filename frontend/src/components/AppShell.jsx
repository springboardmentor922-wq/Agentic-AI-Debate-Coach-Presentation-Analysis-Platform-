import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Swords,
  BarChart3,
  ShieldCheck,
  LogOut,
  Scale,
  Bot,
  ListChecks,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "./RoleBadge";
import { matchmakingApi } from "../api/endpoints";
import IncomingInviteModal from "./IncomingInviteModal";
import { MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["learner", "debate_coach", "educator", "administrator"] },
  { to: "/debate/new/format", label: "Debate Topics", icon: Swords, roles: ["learner", "debate_coach", "educator", "administrator"] },
  { to: "/practice", label: "Practice with AI", icon: Bot, roles: ["learner", "debate_coach", "educator", "administrator"] },
  { to: "/schedule", label: "Schedule", icon: Calendar, roles: ["learner", "debate_coach", "educator", "administrator"] },
  { to: "/sessions", label: "Session Management", icon: ListChecks, roles: ["debate_coach", "educator", "administrator"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["learner", "debate_coach", "educator", "administrator"] },
  { to: "/profile", label: "Profile", icon: User, roles: ["learner", "debate_coach", "educator", "administrator"] },
  { to: "/admin", label: "Administration", icon: ShieldCheck, roles: ["administrator"] },
  { to: "/assistant", label: "AI Assistant", icon: MessageCircle, roles: ["learner", "debate_coach", "educator", "administrator"] },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [incomingInvite, setIncomingInvite] = useState(null);

  useEffect(() => {
    matchmakingApi.heartbeat().catch(() => {});
    const heartbeatInterval = setInterval(() => {
      matchmakingApi.heartbeat().catch(() => {});
    }, 30000);

    const inviteInterval = setInterval(async () => {
      try {
        const { data } = await matchmakingApi.listPendingInvites();
        if (data.length > 0 && !incomingInvite) {
          setIncomingInvite(data[0]);
        }
      } catch {
        // ignore polling errors
      }
    }, 4000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(inviteInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-ink-900">
      <aside className="w-64 shrink-0 border-r border-white/5 bg-ink-800 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/5">
          <Scale className="text-motion-teal" size={22} />
          <span className="font-display text-lg tracking-tight">Podium</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.filter((item) => item.roles.includes(user?.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-motion-teal/10 text-motion-teal"
                    : "text-slate-muted hover:bg-white/5 hover:text-fog"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-motion-teal/15 flex items-center justify-center font-display text-motion-teal">
              {user?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <RoleBadge role={user?.role} className="mt-1" />
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full text-sm">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>

      {incomingInvite && (
        <IncomingInviteModal
          invite={incomingInvite}
          onClose={() => setIncomingInvite(null)}
        />
      )}

      {location.pathname !== "/assistant" && (
        <button
          onClick={() => navigate("/assistant")}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-motion-teal text-ink-900 flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
          title="AI Assistant"
        >
          <Bot size={24} />
        </button>
      )}
    </div>
  );
}