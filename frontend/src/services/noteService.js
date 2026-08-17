import api from "./api";


export const getMyNotes = async () => {

    const response = await api.get(
        "/notes/"
    );

    return response.data;

};


export const createNote = async (note) => {

    const response = await api.post(
        "/notes/",
        note
    );

    return response.data;

};


export const deleteNote = async (id) => {

    const response = await api.delete(
        `/notes/${id}`
    );

    return response.data;

};