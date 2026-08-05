import apiClient from "./apiClient";
import { unwrapApiData } from "../utils/apiHelpers";

const BASE_URL = "/api/v1/debate/reports";

export const getAllReports = async () => {
    const response = await apiClient.get(BASE_URL);
    return unwrapApiData(response.data);
};

export const getReportById = async (reportId) => {
    const response = await apiClient.get(`${BASE_URL}/${reportId}`);
    return unwrapApiData(response.data);
};

export const getReportsBySession = async (sessionId) => {
    const response = await apiClient.get(`${BASE_URL}/session/${sessionId}`);
    return unwrapApiData(response.data);
};

export const getReportsByUser = async (userId) => {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}`);
    return unwrapApiData(response.data);
};

export default {
    getAllReports,
    getReportById,
    getReportsBySession,
    getReportsByUser,
};