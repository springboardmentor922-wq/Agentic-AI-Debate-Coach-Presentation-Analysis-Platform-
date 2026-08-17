import { useEffect, useState } from "react";

import {
    FaUsers,
    FaSearch,
    FaGraduationCap,
    FaUserTie,
    FaUniversity,
    FaUserShield,
} from "react-icons/fa";

import AdminLayout from "../components/AdminLayout";

import {
    getAdminUsers,
} from "../services/adminUserService";


function AdminUsers() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [roleFilter, setRoleFilter] = useState("All");


    // =====================================================
    // LOAD USERS
    // =====================================================

    useEffect(() => {

        loadUsers();

    }, []);


    const loadUsers = async () => {

        try {

            setLoading(true);

            setError("");

            const data = await getAdminUsers();

            console.log(
                "Admin Users:",
                data
            );

            setUsers(data);

        } catch (err) {

            console.error(
                "Failed to load users:",
                err
            );

            setError(
                "Unable to load users."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // FILTER USERS
    // =====================================================

    const filteredUsers = users.filter((user) => {

        const searchText =
            search.toLowerCase();

        const matchesSearch =
            user.full_name
                ?.toLowerCase()
                .includes(searchText)
            ||
            user.email
                ?.toLowerCase()
                .includes(searchText);


        const matchesRole =
            roleFilter === "All"
            ||
            user.role?.toLowerCase()
                === roleFilter.toLowerCase();


        return (
            matchesSearch &&
            matchesRole
        );

    });


    // =====================================================
    // ROLE ICON
    // =====================================================

    const getRoleIcon = (role) => {

        const value =
            role?.toLowerCase();


        if (value === "learner") {

            return <FaGraduationCap />;

        }


        if (value === "coach") {

            return <FaUserTie />;

        }


        if (value === "educator") {

            return <FaUniversity />;

        }


        if (
            value === "administrator"
            ||
            value === "admin"
        ) {

            return <FaUserShield />;

        }


        return <FaUsers />;

    };


    // =====================================================
    // ROLE CLASS
    // =====================================================

    const getRoleClass = (role) => {

        const value =
            role?.toLowerCase();


        if (value === "learner") {

            return "role-badge learner";

        }


        if (value === "coach") {

            return "role-badge coach";

        }


        if (value === "educator") {

            return "role-badge educator";

        }


        if (
            value === "administrator"
            ||
            value === "admin"
        ) {

            return "role-badge administrator";

        }


        return "role-badge";

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <AdminLayout>

                <div className="admin-dashboard">

                    <div className="admin-card">

                        <h2>
                            Loading Users...
                        </h2>

                        <p>
                            Fetching users from the database.
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

                <div className="admin-dashboard">

                    <div className="admin-card">

                        <h2>
                            Something went wrong
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            className="admin-primary-btn"
                            onClick={loadUsers}
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

            <div className="admin-dashboard">


                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="admin-dashboard-header">

                    <div>

                        <h1>
                            User Management
                        </h1>

                        <p>
                            Manage all registered users
                            on the platform.
                        </p>

                    </div>

                </div>


                {/* =====================================
                    SUMMARY
                ====================================== */}

                <div className="admin-stats-grid">


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon purple">

                            <FaUsers />

                        </div>

                        <div className="admin-stat-content">

                            <p>
                                Total Users
                            </p>

                            <h2>
                                {users.length}
                            </h2>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon blue">

                            <FaGraduationCap />

                        </div>

                        <div className="admin-stat-content">

                            <p>
                                Learners
                            </p>

                            <h2>
                                {
                                    users.filter(
                                        u =>
                                            u.role?.toLowerCase()
                                            === "learner"
                                    ).length
                                }
                            </h2>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon green">

                            <FaUserTie />

                        </div>

                        <div className="admin-stat-content">

                            <p>
                                Coaches
                            </p>

                            <h2>
                                {
                                    users.filter(
                                        u =>
                                            u.role?.toLowerCase()
                                            === "coach"
                                    ).length
                                }
                            </h2>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon orange">

                            <FaUniversity />

                        </div>

                        <div className="admin-stat-content">

                            <p>
                                Educators
                            </p>

                            <h2>
                                {
                                    users.filter(
                                        u =>
                                            u.role?.toLowerCase()
                                            === "educator"
                                    ).length
                                }
                            </h2>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    USERS CARD
                ====================================== */}

                <div className="admin-card">


                    {/* Search + Filter */}

                    <div className="admin-users-toolbar">


                        <div className="admin-users-search">

                            <FaSearch />

                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <select
                            value={roleFilter}
                            onChange={(e) =>
                                setRoleFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="All">
                                All Roles
                            </option>

                            <option value="Learner">
                                Learners
                            </option>

                            <option value="Coach">
                                Coaches
                            </option>

                            <option value="Educator">
                                Educators
                            </option>

                            <option value="Administrator">
                                Administrators
                            </option>

                        </select>

                    </div>


                    {/* =================================
                        USER TABLE
                    ================================== */}

                    <div className="admin-users-table-wrapper">

                        <table className="admin-users-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredUsers.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px"
                                            }}
                                        >

                                            No users found.

                                        </td>

                                    </tr>

                                ) : (

                                    filteredUsers.map(
                                        (user) => (

                                            <tr
                                                key={user.id}
                                            >

                                                <td>

                                                    #{user.id}

                                                </td>


                                                <td>

                                                    <div className="admin-user-name">

                                                        <div className="admin-user-avatar">

                                                            {getRoleIcon(
                                                                user.role
                                                            )}

                                                        </div>

                                                        <strong>

                                                            {
                                                                user.full_name
                                                            }

                                                        </strong>

                                                    </div>

                                                </td>


                                                <td>

                                                    {
                                                        user.email
                                                    }

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            getRoleClass(
                                                                user.role
                                                            )
                                                        }
                                                    >

                                                        {
                                                            user.role
                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>


                </div>


            </div>

        </AdminLayout>

    );

}


export default AdminUsers;