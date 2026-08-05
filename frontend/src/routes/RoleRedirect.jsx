import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { getDashboardRouteForRole } from "../utils/roleRoutes";

const RoleRedirect = ({ fallback = "/login" }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to={fallback} replace />;
    }

    return <Navigate to={getDashboardRouteForRole(user?.role)} replace />;
};

export default RoleRedirect;