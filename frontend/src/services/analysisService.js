import apiClient from "./apiClient";

export const analyzeArgument = async (payload) => {
    const response = await apiClient.post("/api/v1/ai/analyze", payload);
    return response.data;
};

export const analyzeDebate = async (sessionId, speechText = "", mediaFile = null, extraFields = {}) => {
    const formData = new FormData();

    formData.append("session_id", sessionId);

    if (speechText && speechText.trim() !== "") {
        formData.append("speech_text", speechText);
    }

    if (mediaFile) {
        formData.append("media_file", mediaFile);
    }

    Object.entries(extraFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
        }
    });

    const response = await apiClient.post("/api/v1/debate/analyze", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const streamDebateAnalysis = async (payload) => {
    const response = await apiClient.post("/api/v1/debate/analyze/stream", payload);
    return response.data;
};

export default {
    analyzeArgument,
    analyzeDebate,
    streamDebateAnalysis,
};