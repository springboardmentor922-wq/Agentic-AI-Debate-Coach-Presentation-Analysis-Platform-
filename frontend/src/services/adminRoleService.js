import api from "./api";


// Get all roles and their users
export const getAdminRoles = async () => {

    const response = await api.get(
        "/admin/roles/"
    );

    return response.data;

};


// Get users belonging to a particular role
export const getUsersByRole = async (role) => {

    const response = await api.get(
        `/admin/roles/${encodeURIComponent(role)}/users`
    );

    return response.data;

};


// Change user's role
export const updateUserRole = async (
    userId,
    newRole
) => {

    const response = await api.put(
        `/admin/roles/users/${userId}/role`,
        null,
        {
            params: {
                new_role: newRole
            }
        }
    );

    return response.data;

};