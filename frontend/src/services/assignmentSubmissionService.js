import api from "./api";


// ============================================================
// LEARNER - GET ASSIGNMENTS
// ============================================================

export const getLearnerAssignments = async () => {

    const response = await api.get(
        "/assignment-submissions/learner"
    );

    return response.data;

};


// ============================================================
// LEARNER - SUBMIT
// ============================================================

export const submitAssignment = async (
    assignmentId,
    responseText
) => {

    const response = await api.post(

        "/assignment-submissions/submit",

        {
            assignment_id:
                assignmentId,

            response:
                responseText
        }

    );

    return response.data;

};


// ============================================================
// EDUCATOR - GET SUBMISSIONS
// ============================================================

export const getEducatorSubmissions = async () => {

    const response = await api.get(

        "/assignment-submissions/educator"

    );

    return response.data;

};


// ============================================================
// EDUCATOR - REVIEW
// ============================================================

export const reviewAssignment = async (

    submissionId,

    score,

    feedback

) => {

    const response = await api.put(

        `/assignment-submissions/educator/${submissionId}/review`,

        {

            score: Number(score),

            educator_feedback:
                feedback

        }

    );

    return response.data;

};