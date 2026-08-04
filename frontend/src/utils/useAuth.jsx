import { Navigate } from "react-router-dom";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

// Wrap a route with this to require login, and optionally a specific role.
// <ProtectedRoute roles={["Admin"]}><AdminDashboard /></ProtectedRoute>
export function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
