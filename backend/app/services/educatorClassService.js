import api from "./api";


// Get learners who are not assigned
// to any classroom
export const getAvailableLearners = async (classId) => {

    const response = await api.get(
        `/educator/classes/${classId}/available-learners`
    );

    return response.data;
};


// Assign selected learners to a classroom
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