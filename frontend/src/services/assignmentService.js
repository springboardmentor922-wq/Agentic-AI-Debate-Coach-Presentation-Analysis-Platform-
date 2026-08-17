import api from "./api";


// ============================================================
// GET EDUCATOR ASSIGNMENTS
// ============================================================

export const getEducatorAssignments = async () => {

    const response = await api.get(
        "/educator/assignments/"
    );

    return response.data;

};


// ============================================================
// CREATE ASSIGNMENT
// ============================================================

export const createAssignment = async (
    assignment
) => {

    const response = await api.post(

        "/educator/assignments/",

        assignment

    );

    return response.data;

};


// ============================================================
// DELETE ASSIGNMENT
// ============================================================

export const deleteAssignment = async (
    assignmentId
) => {

    const response = await api.delete(

        `/educator/assignments/${assignmentId}`

    );

    return response.data;

};