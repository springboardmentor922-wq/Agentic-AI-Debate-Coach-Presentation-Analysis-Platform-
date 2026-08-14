import { useEffect, useState } from "react";

import {
    getToken,
    getUser,
    saveToken,
    saveUser,
    logoutUser
} from "../services/tokenService";

import apiClient from "../services/apiClient";
import { getDashboardRouteForRole } from "../utils/roleRoutes";
import { AuthContext } from "./authContext.js";

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => getUser());

    const [token, setToken] = useState(() => getToken());

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;

        const syncCurrentUser = async () => {
            const currentToken = getToken();
            if (!currentToken) return;

            try {
                const res = await apiClient.get("/auth/me");
                if (active && res?.data) {
                    saveUser(res.data);
                    setUser(res.data);
                }
            } catch (err) {
                if (active) {
                    logoutUser();
                    setUser(null);
                    setToken(null);
                }
            }
        };

        void syncCurrentUser();

        const handleUnauthorized = () => {
            logoutUser();
            setUser(null);
            setToken(null);
        };

        window.addEventListener("auth:unauthorized", handleUnauthorized);

        return () => {
            active = false;
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
