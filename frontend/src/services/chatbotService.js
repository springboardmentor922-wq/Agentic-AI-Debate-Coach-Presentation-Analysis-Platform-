import apiClient from "./apiClient";

export const sendChatMessage = async (payload) => {
    return apiClient.post("/api/v1/chat", payload);
};
