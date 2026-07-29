import { createContext, useContext, useEffect, useState } from "react";

import {
    getToken,
    getUser,
    saveToken,
    saveUser,
    logoutUser
} from "../services/tokenService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token = getToken();

        const storedUser = getUser();

        if (token && storedUser) {

            setUser(storedUser);

        }

        setLoading(false);

    }, []);

    // ============================================
    // Login
    // ============================================

    const login = (token, userData) => {

        saveToken(token);

        saveUser(userData);

        setUser(userData);

    };

    // ============================================
    // Logout
    // ============================================

    const logout = () => {

        logoutUser();

        setUser(null);

    };

    return (

        <AuthContext.Provider

            value={{

                user,

                loading,

                login,

                logout,

                isAuthenticated: !!user

            }}

        >

            {children}

        </AuthContext.Provider>

    );

};

export const useAuth = () => useContext(AuthContext);