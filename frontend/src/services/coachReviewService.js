import api from "./api";

export const submitCoachReview = async (sessionId, review) => {

    const response = await api.post(
        `/coach-review/${sessionId}`,
        review
    );

    return response.data;

};