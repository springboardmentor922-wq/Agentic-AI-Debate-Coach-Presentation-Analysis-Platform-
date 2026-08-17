import api from "./api";

// Dashboard Summary
export const getDashboardSummary = async () => {
    const response = await api.get("/dashboard/");
    return response.data;
};

// Evaluation History
export const getEvaluationHistory = async () => {
    const response = await api.get("/dashboard/history");
    return response.data;
};

// Single Evaluation
export const getEvaluationDetail = async (id) => {
    const response = await api.get(`/dashboard/history/${id}`);
    return response.data;
};