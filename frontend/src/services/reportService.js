import api from "./api";


export const getPerformanceHistory = async () => {

    const response = await api.get(
        "/dashboard/history"
    );

    return response.data;

};


export const getPerformanceSummary = async () => {

    const response = await api.get(
        "/dashboard/"
    );

    return response.data;

};