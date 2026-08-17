import api from "./api";

// ==========================================
// ANALYZE PRESENTATION
// ==========================================

export const analyzePresentation = async (presentation) => {

    const response = await api.post(
        "/ai/analyze-presentation",
        {
            presentation
        }
    );

    return response.data;
};


// ==========================================
// GET ALL PRESENTATION REVIEWS
// ==========================================

export const getPresentationReviews = async () => {

    const response = await api.get(
        "/ai/presentation-reviews"
    );

    return response.data;
};


// ==========================================
// GET SINGLE PRESENTATION REVIEW
// ==========================================

export const getPresentationReview = async (id) => {

    const response = await api.get(
        `/ai/presentation-reviews/${id}`
    );

    return response.data;
};