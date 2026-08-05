import apiClient from "./apiClient";
import { unwrapApiData } from "../utils/apiHelpers";

const BASE_URL = "/profile";

export const getMyProfile = async () => {
    const response = await apiClient.get(`${BASE_URL}/me`);
    return unwrapApiData(response.data);
};

export const createProfile = async (profileData) => {
    const response = await apiClient.post(BASE_URL, profileData);
    return unwrapApiData(response.data);
};

export const updateMyProfile = async (profileData) => {
    const response = await apiClient.put(`${BASE_URL}/me`, profileData);
    return unwrapApiData(response.data);
};

export default {
    getMyProfile,
    createProfile,
    updateMyProfile,
};