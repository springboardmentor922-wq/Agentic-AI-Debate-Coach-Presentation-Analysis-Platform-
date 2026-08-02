import api from "./api";

export const getAllUsers = async () => {

    const response = await api.get("/users");

    return response.data;

};

export const getLearners = async () => {

    const response = await api.get("/users/learners");

    return response.data;

};