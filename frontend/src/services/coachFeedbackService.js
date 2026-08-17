import api from "./api";

export const getCoachFeedbacks = async () => {
    const response = await api.get("/learner-feedback/");
    return response.data;
};