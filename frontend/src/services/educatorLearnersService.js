import api from "./api";


export const getEducatorLearners = async () => {

    const response = await api.get(
        "/educator/learners/"
    );

    return response.data;

};