import api from "./api";

export const getCoachDashboardSummary = async () => {
    const response = await api.get("/coach/dashboard/summary");
    return response.data;
};

export const getRecentActivity = async () => {

    const response = await api.get(
        "/coach/dashboard/recent-activity"
    );

    return response.data;

};

export const getLearners = async () => {

    const response = await api.get(
        "/coach/dashboard/learners"
    );

    return response.data;

};

export const getLearnerDetail = async (id) => {

    const response = await api.get(
        `/coach/dashboard/learner/${id}`
    );

    return response.data;

};