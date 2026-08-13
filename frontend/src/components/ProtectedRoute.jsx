import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="animate-pulse text-slate-muted font-mono text-sm">Loading session…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!user.onboarding_completed && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.onboarding_completed && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}