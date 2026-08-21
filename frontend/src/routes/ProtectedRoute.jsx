import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({

    children,

    allowedRoles = []

}) => {

    const {

        user,

        loading,

        isAuthenticated

    } = useAuth();

    if (loading) {

        return <h2>Loading...</h2>;

    }

    if (!isAuthenticated) {

        return <Navigate to="/login" replace />;

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