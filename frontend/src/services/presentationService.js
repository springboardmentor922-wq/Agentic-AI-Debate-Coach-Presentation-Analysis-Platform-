import apiClient from "./apiClient";

export const presentationService = {
    /**
     * Upload a presentation recording file (multipart/form-data)
     */
    uploadRecording: async (formData) => {
        const response = await apiClient.post("/api/v1/presentation/recordings/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    /**
     * Fetch user's presentation recordings history
     */
    getRecordings: async () => {
        const response = await apiClient.get("/api/v1/presentation/recordings");
        return response.data;
    },

    /**
     * Fetch metadata for a specific recording
     */
    getRecordingDetails: async (recordingId) => {
        const response = await apiClient.get(`/api/v1/presentation/recordings/${recordingId}`);
        return response.data;
    },

    /**
     * Get stream URL for audio playback
     */
    getAudioStreamUrl: (recordingId) => {
        const token = localStorage.getItem("access_token") || localStorage.getItem("token") || "";
        const baseURL = apiClient.defaults.baseURL || "http://127.0.0.1:8000";
        return `${baseURL}/api/v1/presentation/recordings/${recordingId}/audio?token=${token}`;
    },
};

export default presentationService;
