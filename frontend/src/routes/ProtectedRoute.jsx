import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({

    children,

    allowedRoles = []

}) => {

    const location = useLocation();

    const {

        user,

        loading,

        isAuthenticated

    } = useAuth();

    if (loading) {

        return <h2>Loading...</h2>;

    }

    if (!isAuthenticated) {

        return <Navigate to="/login" replace state={{ from: location }} />;

    }

    if (

        allowedRoles.length > 0 &&

        !allowedRoles.includes(user.role)

    ) {

        return <Navigate to="/unauthorized" replace />;

    }

    return children;

};

export default ProtectedRoute;