import api from "./api";

export const getRecommendations = async (sessionId) => {

    const response = await api.get(
        `/recommendations/${sessionId}`
    );

    return response.data;

};