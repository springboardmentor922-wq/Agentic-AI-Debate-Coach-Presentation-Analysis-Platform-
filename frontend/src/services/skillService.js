import apiClient from "./apiClient";
import { unwrapApiData } from "../utils/apiHelpers";

const BASE_URL = "/skills";

export const getMySkill = async () => {
    const response = await apiClient.get(`${BASE_URL}/me`);
    return unwrapApiData(response.data);
};

export const createSkill = async (skillData) => {
    const response = await apiClient.post(BASE_URL, skillData);
    return unwrapApiData(response.data);
};

export const updateMySkill = async (skillData) => {
    const response = await apiClient.put(`${BASE_URL}/me`, skillData);
    return unwrapApiData(response.data);
};

export default {
    getMySkill,
    createSkill,
    updateMySkill,
};