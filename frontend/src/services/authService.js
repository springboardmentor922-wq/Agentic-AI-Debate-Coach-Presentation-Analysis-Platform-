import apiClient from "./apiClient";
import { clearSession, getUser } from "./tokenService";

export const registerUser = async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
};

export const logoutUser = () => {
    clearSession();
};

export const getCurrentUser = () => getUser();

export const refreshToken = async () => {
    try {
        const response = await apiClient.post("/auth/refresh");
        return response.data;
    }
    catch {
        return null;
    }
};