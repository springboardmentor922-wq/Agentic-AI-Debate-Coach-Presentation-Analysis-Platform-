import api from "./api";


export const createCoachingPlan = async (
    plan
) => {

    const response = await api.post(
        "/coach/coaching-plans/",
        plan
    );

    return response.data;

};


export const getCoachingPlans = async () => {

    const response = await api.get(
        "/coach/coaching-plans/"
    );

    return response.data;

};


export const getCoachingPlan = async (
    id
) => {

    const response = await api.get(
        `/coach/coaching-plans/${id}`
    );

    return response.data;

};


export const updateCoachingPlanStatus =
    async (id, status) => {

        const response = await api.patch(
            `/coach/coaching-plans/${id}/status`,
            null,
            {
                params: {
                    status
                }
            }
        );

        return response.data;

    };

export const getMyCoachingPlans = async () => {

    const response = await api.get(
        "/coach/coaching-plans/my-plans"
    );

    return response.data;

};