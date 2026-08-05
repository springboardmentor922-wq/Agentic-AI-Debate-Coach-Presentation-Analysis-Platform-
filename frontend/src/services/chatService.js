import apiClient from "./apiClient";

export const sendChatMessage = async (payload) => {
    const response = await apiClient.post("/api/v1/chat", payload);
    return response.data;
};

export default {
    sendChatMessage,
};