import { useEffect, useState } from "react";

import AdminLayout from "../components/AdminLayout";

import {
    getAdminRoles,
    updateUserRole,
} from "../services/adminRoleService";


function AdminRoles() {

    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [expandedRole, setExpandedRole] = useState(null);

    const [savingUser, setSavingUser] = useState(null);


    // =====================================================
    // LOAD ROLES
    // =====================================================

    const loadRoles = async () => {

        try {

            setLoading(true);

            setError("");

            const data = await getAdminRoles();

            setRoles(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load roles:",
                error
            );

            setError(
                error?.response?.data?.detail ||
                "Failed to load roles."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD DATA WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {

        loadRoles();

    }, []);


    // =====================================================
    // OPEN / CLOSE ROLE
    // =====================================================

    const toggleRole = (roleName) => {

        if (expandedRole === roleName) {

            setExpandedRole(null);

        } else {

            setExpandedRole(roleName);

        }

    };


    // =====================================================
    // CHANGE USER ROLE
    // =====================================================

    const handleRoleChange = async (
        userId,
        newRole
    ) => {

        try {

            setSavingUser(userId);

            await updateUserRole(
                userId,
                newRole
            );

            // Reload latest data
            await loadRoles();

            alert(
                "User role updated successfully."
            );

        } catch (error) {

            console.error(
                "Failed to update role:",
                error
            );

            alert(
                error?.response?.data?.detail ||
                "Failed to update user role."
            );

        } finally {

            setSavingUser(null);

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <AdminLayout>

                <div className="admin-page">

                    <div className="admin-card">

                        <h2>
                            Role & Permissions
                        </h2>

                        <p>
                            Loading roles...
                        </p>

                    </div>

                </div>

            </AdminLayout>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <AdminLayout>

                <div className="admin-page">

                    <div className="admin-card">

                        <h2>
                            Role & Permissions
                        </h2>

                        <p
                            style={{
                                color: "red"
                            }}
                        >
                            {error}
                        </p>

                        <button
                            className="admin-primary-btn"
                            onClick={loadRoles}
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </AdminLayout>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <AdminLayout>

            <div className="admin-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-page-header">

                    <div>

                        <h1>
                            Role & Permissions
                        </h1>

                        <p>
                            Manage user roles and permissions.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    ROLE CARDS
                ================================================= */}

                <div className="admin-roles-grid">

                    {roles.map((role) => (

                        <div
                            className="admin-role-card"
                            key={role.name}
                        >


                            {/* ROLE HEADER */}

                            <div
                                className="admin-role-header"
                                onClick={() =>
                                    toggleRole(
                                        role.name
                                    )
                                }
                            >

                                <div
                                    className="admin-role-icon"
                                >

                                    {role.name === "Learner" && "🎓"}

                                    {role.name === "Coach" && "👨‍🏫"}

                                    {role.name === "Educator" && "🏫"}

                                    {role.name === "Administrator" && "🛡️"}

                                </div>


                                <div
                                    className="admin-role-info"
                                >

                                    <h3>
                                        {role.name}
                                    </h3>

                                    <p>
                                        {role.user_count} user
                                        {role.user_count !== 1
                                            ? "s"
                                            : ""}
                                    </p>

                                </div>


                                <div
                                    className="admin-role-arrow"
                                >

                                    {expandedRole === role.name
                                        ? "▲"
                                        : "▼"}

                                </div>

                            </div>


                            {/* =================================================
                                USERS
                            ================================================= */}

                            {expandedRole === role.name && (

                                <div className="admin-role-users">


                                    {role.users &&
                                    role.users.length > 0 ? (

                                        role.users.map(
                                            (user) => (

                                                <div
                                                    className="admin-role-user"
                                                    key={user.id}
                                                >


                                                    {/* AVATAR */}

                                                    <div
                                                        className="admin-role-user-avatar"
                                                    >

                                                        {user.full_name
                                                            ?.charAt(0)
                                                            .toUpperCase() || "U"}

                                                    </div>


                                                    {/* USER INFORMATION */}

                                                    <div
                                                        className="admin-role-user-info"
                                                    >

                                                        <strong>
                                                            {user.full_name ||
                                                                "Unknown User"}
                                                        </strong>

                                                        <small>
                                                            {user.email}
                                                        </small>

                                                    </div>


                                                    {/* ROLE DROPDOWN */}

                                                    <div
                                                        className="admin-role-user-action"
                                                    >

                                                        <select
                                                            value={
                                                                user.role
                                                            }
                                                            disabled={
                                                                savingUser ===
                                                                user.id
                                                            }
                                                            onChange={(e) =>
                                                                handleRoleChange(
                                                                    user.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                        >

                                                            <option value="Learner">
                                                                Learner
                                                            </option>

                                                            <option value="Coach">
                                                                Coach
                                                            </option>

                                                            <option value="Educator">
                                                                Educator
                                                            </option>

                                                            <option value="Administrator">
                                                                Administrator
                                                            </option>

                                                        </select>


                                                        {savingUser ===
                                                            user.id && (

                                                            <span
                                                                className="role-saving"
                                                            >
                                                                Saving...
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            )
                                        )

                                    ) : (

                                        <div
                                            className="admin-empty-users"
                                        >

                                            <p>
                                                No users in this role.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            )}

                        </div>

                    ))}

                </div>


            </div>

        </AdminLayout>

    );

}


export default AdminRoles;