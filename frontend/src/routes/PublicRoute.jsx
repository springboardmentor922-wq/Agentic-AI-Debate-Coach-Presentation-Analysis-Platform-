import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, getDefaultRoute } = useAuth();

    if (loading) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to={getDefaultRoute()} replace />;
    }

    return children;
};

export default PublicRoute;