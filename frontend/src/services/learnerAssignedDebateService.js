import api from "./api";


// ==========================================
// GET LEARNER ASSIGNED DEBATES
// ==========================================

export const getAssignedDebates = async () => {

    const response = await api.get(
        "/assigned-debates/"
    );

    return response.data;

};