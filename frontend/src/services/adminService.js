import api from "./api";


export const getAdminDashboardSummary = async () => {

    const response = await api.get(
        "/admin/dashboard/summary"
    );

    return response.data;

};