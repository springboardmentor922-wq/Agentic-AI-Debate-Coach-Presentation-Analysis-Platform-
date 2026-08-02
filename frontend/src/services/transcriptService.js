import api from "./api";

export const getTranscript = async (sessionId) => {

    const response = await api.get(
        `/debate/${sessionId}/transcript`
    );

    return response.data;

};