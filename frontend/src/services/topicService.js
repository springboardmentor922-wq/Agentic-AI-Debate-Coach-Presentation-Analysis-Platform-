import api from "./api";

export const getTopics = async () => {

    const response = await api.get("/topics/");

    return response.data;

};

export const createTopic = async (topic) => {

    const response = await api.post(
        "/topics/learner",
        topic
    );

    return response.data;

};