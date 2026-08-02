import api from "./api";

export const getSessions = async () => {
    const response = await api.get("/sessions");
    return response.data;
};

export const createSession = async (session) => {
    const response = await api.post("/sessions", session);
    return response.data;
};

export const debateWithAI = async (sessionId, text) => {

    const response = await api.post(
        `/sessions/${sessionId}/debate`,
        null,
        {
            params: {
                text
            }
        }
    );

    return response.data;
};