import api from "./api";

export const getOverview = async () => {

    const response = await api.get("/analytics/overview");

    return response.data;

};

export const getHistory = async () => {

    const response = await api.get("/analytics/history");

    return response.data;

};

export const getPerformance = async (sessionId) => {

    const response = await api.get(
        `/analytics/performance/${sessionId}`
    );

    return response.data;

};