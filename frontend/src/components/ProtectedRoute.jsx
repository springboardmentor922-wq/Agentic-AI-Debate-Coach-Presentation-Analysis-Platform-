import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="
          flex
          h-screen
          items-center
          justify-center
          bg-gradient-to-br
          from-blue-500/5
          via-indigo-500/5
          to-violet-500/10

          dark:from-blue-500/10
          dark:via-indigo-500/10
          dark:to-violet-500/15
        "
      >
        <div
          className="
            h-12
            w-12
            animate-spin
            rounded-full
            border-2
            border-blue-500
            border-t-violet-500
            shadow-[0_0_20px_rgba(99,102,241,0.35)]
          "
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
