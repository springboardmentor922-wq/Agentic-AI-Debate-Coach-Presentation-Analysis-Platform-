import api from "./api";

export const debateWithAI = async (
    topic,
    user_position,
    user_argument
) => {

    const response = await api.post("/ai/debate", {
        topic,
        user_position,
        user_argument
    });

    return response.data;
};