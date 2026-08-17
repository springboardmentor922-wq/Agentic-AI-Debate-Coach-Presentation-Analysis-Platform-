import api from "./api";


// ==========================================
// GET ASSIGNED DEBATES
// ==========================================

export const getAssignedDebates = async () => {

    const response = await api.get(
        "/assigned-debates/"
    );

    return response.data;

};


// ==========================================
// ASSIGN NEW DEBATE
// ==========================================

export const assignDebate = async (
    debate
) => {

    const response = await api.post(
        "/assigned-debates/",
        debate
    );

    return response.data;

};