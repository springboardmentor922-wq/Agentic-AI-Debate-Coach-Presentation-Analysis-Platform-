import { useEffect, useState } from "react";

import {
    getToken,
    getUser,
    saveToken,
    saveUser,
    logoutUser
} from "../services/tokenService";

import { getDashboardRouteForRole } from "../utils/roleRoutes";
import { AuthContext } from "./authContext.js";

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => getUser());

    const [token, setToken] = useState(() => getToken());

    const [loading] = useState(false);

    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            setToken(null);
        };

        window.addEventListener("auth:unauthorized", handleUnauthorized);

        return () => {
            window.removeEventListener("auth:unauthorized", handleUnauthorized);
        };


    }, []);

    // ============================================
    // Login
    // ============================================

    const login = (authToken, userData) => {

        saveToken(authToken);

        saveUser(userData);

        setToken(authToken);

        setUser(userData);

    };

    // ============================================
    // Logout
    // ============================================

    const logout = () => {

        logoutUser();

        setUser(null);

        setToken(null);

    };

    const hasRole = (allowedRoles = []) => {
        if (allowedRoles.length === 0) {
            return true;
        }

        return allowedRoles.includes(user?.role);
    };

    const getDefaultRoute = () => getDashboardRouteForRole(user?.role);

    return (

        <AuthContext.Provider

            value={{

                user,

                token,

                loading,

                login,

                logout,

                hasRole,

                getDefaultRoute,

                isAuthenticated: !!token && !!user

            }}

        >

            {children}

        </AuthContext.Provider>

    );

};
