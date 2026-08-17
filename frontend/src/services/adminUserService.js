import api from "./api";


// =========================================================
// GET ALL USERS
// =========================================================

export const getAdminUsers = async () => {

    const response = await api.get("/admin/users/");

    return response.data;

};


// =========================================================
// GET SINGLE USER
// =========================================================

export const getAdminUser = async (userId) => {

    const response = await api.get(
        `/admin/users/${userId}`
    );

    return response.data;

};