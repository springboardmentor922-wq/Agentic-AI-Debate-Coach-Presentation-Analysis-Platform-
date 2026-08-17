import api from "./api";

export const getQueue = async () => {

    const response = await api.get("/ai-queue/");

    return response.data;

};