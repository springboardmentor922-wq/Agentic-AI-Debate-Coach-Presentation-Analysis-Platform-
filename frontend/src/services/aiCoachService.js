import api from "./api";

export const askAICoach = async (message, page = "general") => {

    const response = await api.post("/ai/chat", {
        message,
        page
    });

    return response.data;

};