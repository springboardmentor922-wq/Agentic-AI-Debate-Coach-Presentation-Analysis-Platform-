import api from "./api";

export const getDebateSessions = async () => {

    const response = await api.get(
        "/coach/debate-sessions/"
    );

    return response.data;

};