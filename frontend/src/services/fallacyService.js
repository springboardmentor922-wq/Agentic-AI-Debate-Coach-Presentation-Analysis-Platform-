import api from "./api";


export const detectFallacies = async (
    argument
) => {

    return api.post(
        "/ai/fallacies",
        {
            argument
        }
    );

};


export const getFallacyReports = async () => {

    const response = await api.get(
        "/ai/fallacy-reports"
    );

    return response.data;

};


export const getFallacyReport = async (
    id
) => {

    const response = await api.get(
        `/ai/fallacy-reports/${id}`
    );

    return response.data;

};