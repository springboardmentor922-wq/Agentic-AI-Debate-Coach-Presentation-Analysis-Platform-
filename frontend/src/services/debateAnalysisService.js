import apiClient from "./apiClient";

export const analyzeDebate = async (
    sessionId,
    speechText = "",
    mediaFile = null
) => {

    const formData = new FormData();

    formData.append("session_id", sessionId);

    // Send typed speech if available
    if (speechText && speechText.trim() !== "") {
        formData.append("speech_text", speechText);
    }

    // Send uploaded audio/video if available
    if (mediaFile) {
        formData.append("media_file", mediaFile);
    }

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