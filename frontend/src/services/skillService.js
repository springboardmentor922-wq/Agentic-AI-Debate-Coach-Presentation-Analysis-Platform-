import apiClient from "./apiClient";
import { unwrapApiData } from "../utils/apiHelpers";

const BASE_URL = "/skills";

export const getMySkill = async () => {
    try {
        const response = await apiClient.get(`${BASE_URL}/me`);
        return unwrapApiData(response.data);
    } catch (error) {
        if (error.response?.status === 404) {
            // Return safe default skill metrics when user skill record does not exist in DB yet
            return {
                communication_score: 75,
                critical_thinking_score: 70,
                presentation_score: 72,
                argument_score: 74,
                confidence_score: 76,
                total_debates: 0,
                total_presentations: 0,
            };
        }
        throw error;
    }
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