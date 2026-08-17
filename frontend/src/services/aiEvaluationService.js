import api from "./api";


export const getEvaluationQueue = async () => {

    const response = await api.get(
        "/coach/ai-evaluation-queue/"
    );

    return response.data;

};


export const getEvaluationDetails = async (sessionId) => {

    const response = await api.get(
        `/coach-review/${sessionId}`
    );

    return response.data;

};


export const submitCoachReview = async (
    sessionId,
    review
) => {

    const response = await api.post(
        `/coach-review/${sessionId}`,
        review
    );

    return response.data;

};