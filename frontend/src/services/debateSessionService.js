import api from "./api";

// ==========================================
// CREATE DEBATE SESSION
// ==========================================

export const createDebateSession = async (data) => {

    const response = await api.post(
        "/debate/sessions",
        data
    );

    return response.data;
};


// ==========================================
// GET ALL DEBATE SESSIONS
// ==========================================

export const getDebateSessions = async () => {

    const response = await api.get(
        "/debate/sessions"
    );

    return response.data;
};


// ==========================================
// GET ONE DEBATE SESSION
// ==========================================

export const getDebateSession = async (sessionId) => {

    const response = await api.get(
        `/debate/sessions/${sessionId}`
    );

    return response.data;
};


// ==========================================
// UPDATE SESSION STATUS
// ==========================================

export const updateDebateSession = async (
    sessionId,
    status
) => {

    const response = await api.put(
        `/debate/sessions/${sessionId}`,
        null,
        {
            params: {
                status
            }
        }
    );

    return response.data;
};


// ==========================================
// DELETE DEBATE SESSION
// ==========================================

export const deleteDebateSession = async (
    sessionId
) => {

    const response = await api.delete(
        `/debate/sessions/${sessionId}`
    );

    return response.data;
};