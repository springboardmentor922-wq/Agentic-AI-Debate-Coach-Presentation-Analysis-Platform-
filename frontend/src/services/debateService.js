import api from "./api";


// Get all debate topics
export const getTopics = () => {
    return api.get("/debate/topics");
};


// Submit AI evaluation
export const submitEvaluation = (formData, token) => {

    return api.post(
        "/evaluation/submit",
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );

};


// Get learner's previous evaluations
export const getMyDebates = async () => {

    const response = await api.get(
        "/dashboard/history"
    );

    return response.data;

};


// Get one particular evaluation
export const getDebateEvaluation = async (id) => {

    const response = await api.get(
        `/dashboard/history/${id}`
    );

    return response.data;

};