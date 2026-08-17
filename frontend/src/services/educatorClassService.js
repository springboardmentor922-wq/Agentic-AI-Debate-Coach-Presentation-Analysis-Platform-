import api from "./api";


// ==========================================
// GET ALL EDUCATOR CLASSES
// ==========================================

export const getEducatorClasses = async () => {

    const response = await api.get(
        "/educator/classes"
    );

    return response.data;
};


// ==========================================
// GET ONE CLASS
// ==========================================

export const getEducatorClass = async (classId) => {

    const response = await api.get(
        `/educator/classes/${classId}`
    );

    return response.data;
};


// ==========================================
// CREATE CLASS
// ==========================================

export const createEducatorClass = async (
    name,
    description
) => {

    const response = await api.post(
        "/educator/classes",
        {
            name,
            description
        }
    );

    return response.data;
};


// ==========================================
// UPDATE CLASS
// ==========================================

export const updateEducatorClass = async (
    classId,
    name,
    description
) => {

    const response = await api.put(
        `/educator/classes/${classId}`,
        {
            name,
            description
        }
    );

    return response.data;
};


// ==========================================
// DELETE CLASS
// ==========================================

export const deleteEducatorClass = async (
    classId
) => {

    const response = await api.delete(
        `/educator/classes/${classId}`
    );

    return response.data;
};


// ==========================================
// GET AVAILABLE LEARNERS
// ==========================================

export const getAvailableLearners = async (
    classId
) => {

    const response = await api.get(
        `/educator/classes/${classId}/available-learners`
    );

    return response.data;
};


// ==========================================
// ASSIGN LEARNERS TO CLASS
// ==========================================

export const assignLearnersToClass = async (
    classId,
    learnerIds
) => {

    const response = await api.post(
        `/educator/classes/${classId}/assign-learners`,
        learnerIds
    );

    return response.data;
};

export const getEducatorLearnerDetail = async (
    learnerId
) => {

    const response = await api.get(
        `/educator/learners/${learnerId}`
    );

    return response.data;
};

// ==========================================
// GET LEARNER EVALUATION DETAIL
// ==========================================

export const getLearnerEvaluationDetail = async (
    learnerId,
    evaluationId
) => {

    const response = await api.get(
        `/educator/learners/${learnerId}/evaluations/${evaluationId}`
    );

    return response.data;
};

// ==========================================
// REMOVE LEARNER FROM CLASS
// ==========================================

export const removeLearnerFromClass = async (
    classId,
    learnerId
) => {

    const response = await api.delete(
        `/educator/classes/${classId}/learners/${learnerId}`
    );

    return response.data;
};
// ==========================================
// GET CLASS ANALYTICS
// ==========================================

export const getClassAnalytics = async (
    classId
) => {

    const response = await api.get(
        `/educator/classes/${classId}/analytics`
    );

    return response.data;
};
