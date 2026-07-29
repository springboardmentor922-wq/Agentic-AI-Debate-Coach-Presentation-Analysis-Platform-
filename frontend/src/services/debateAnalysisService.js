import apiClient from "./apiClient";

export const analyzeDebate = async (sessionId, mediaFile) => {

    const formData = new FormData();

    formData.append("session_id", sessionId);

    formData.append("media_file", mediaFile);

    return await apiClient.post(
    "/api/v1/debate/analyze",
    formData,
    {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
);

};