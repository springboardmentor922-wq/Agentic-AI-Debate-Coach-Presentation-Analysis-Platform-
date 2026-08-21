/*
=========================================================
Authentication Service
=========================================================
*/

import apiClient from "./apiClient";


// ================================================
// Register User
// ================================================

export const registerUser = async (userData) => {

    try {

        const response = await apiClient.post(

            "/auth/register",

            userData

        );

        return response.data;

    }

    catch (error) {

        throw error.response?.data || error;

    }

};


// ================================================
// Login User
// ================================================

export const loginUser = async (credentials) => {

    try {

        const response = await apiClient.post(

            "/auth/login",

            credentials

        );

        return response.data;

    }

    catch (error) {

        throw error.response?.data || error;

    }

};


// ================================================
// Logout
// ================================================

export const logoutUser = () => {

    localStorage.removeItem("access_token");

    localStorage.removeItem("user_data");

};


// ================================================
// Get Current User
// ================================================

export const getCurrentUser = () => {

    return JSON.parse(

        localStorage.getItem("user_data")

    );

};