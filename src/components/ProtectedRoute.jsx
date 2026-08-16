import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const adminSession = sessionStorage.getItem("adminAuthenticated");

  console.log("Protected Route Token:", token);

  if (!token && !adminSession) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
