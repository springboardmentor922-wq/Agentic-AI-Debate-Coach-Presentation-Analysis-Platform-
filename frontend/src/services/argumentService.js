import api from "./api";


export const analyzeArgument = async (argument) => {

    return api.post(
        "/ai/analyze-argument",
        {
            argument,
        }
    );

};


export const getArgumentReviews = async () => {

    const response = await api.get(
        "/ai/argument-reviews"
    );

    return response.data;

};


export const getArgumentReview = async (id) => {

    const response = await api.get(
        `/ai/argument-reviews/${id}`
    );

    return response.data;

};