import api from "./api";


// ============================================================
// EDUCATOR - CREATE ANNOUNCEMENT
// ============================================================

export const createAnnouncement = async (
    data
) => {

    const response = await api.post(
        "/announcements/",
        data
    );

    return response.data;
};


// ============================================================
// EDUCATOR - GET ANNOUNCEMENTS
// ============================================================

export const getEducatorAnnouncements =
    async () => {

        const response = await api.get(
            "/announcements/educator"
        );

        return response.data;
    };


// ============================================================
// LEARNER - GET ANNOUNCEMENTS
// ============================================================

export const getLearnerAnnouncements =
    async () => {

        const response = await api.get(
            "/announcements/learner"
        );

        return response.data;
    };


// ============================================================
// EDUCATOR - DELETE
// ============================================================

export const deleteAnnouncement =
    async (id) => {

        const response = await api.delete(
            `/announcements/${id}`
        );

        return response.data;
    };