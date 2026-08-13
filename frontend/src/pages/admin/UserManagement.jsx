import { useEffect, useMemo, useState } from "react";
import { FaUsers, FaUserCheck, FaUserSlash, FaSearch, FaFilter, FaUserPlus } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import { getAdminOverview, toggleUserStatus, updateUserRole } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";
import { toArray, formatDate } from "../../utils/learnerHelpers";

import "./UserManagement.css";

const UserManagement = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        let active = true;

        const loadUsers = async () => {
            try {
                setLoading(true);
                const overview = await getAdminOverview().catch(() => ({ users: [], roles: [] }));
                if (!active) return;

                setUsers(toArray(overview.users));
                setError("");
            } catch (err) {
                console.error(err);
                if (active) setError("Failed to load user management records.");
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadUsers();
        return () => { active = false; };
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const query = searchTerm.toLowerCase();
            const nameMatch = (u.full_name || u.name || "").toLowerCase().includes(query);
            const emailMatch = (u.email || "").toLowerCase().includes(query);
            const matchesSearch = !query || nameMatch || emailMatch;

            const matchesRole = roleFilter === "all" || String(u.role || u.role_name || "").toLowerCase() === roleFilter.toLowerCase();
            const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? u.is_active !== false : u.is_active === false);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    const stats = useMemo(() => {
        const activeCount = users.filter((u) => u.is_active !== false).length;
        const coachCount = users.filter((u) => String(u.role || u.role_name || "").toLowerCase().includes("coach")).length;
        const learnerCount = users.filter((u) => String(u.role || u.role_name || "").toLowerCase().includes("learner")).length;

        return [
            { title: "Total Users", value: users.length, icon: <FaUsers />, color: "#2563EB" },
            { title: "Active Accounts", value: activeCount, icon: <FaUserCheck />, color: "#10B981" },
            { title: "Debate Coaches", value: coachCount, icon: <FaUserCheck />, color: "#8B5CF6" },
            { title: "Learners", value: learnerCount, icon: <FaUserSlash />, color: "#F59E0B" },
        ];
    }, [users]);

    const handleToggleStatus = async (userItem) => {
        try {
            const newStatus = userItem.is_active === false;
            await toggleUserStatus(userItem.id, newStatus);
            setUsers((prev) => prev.map((u) => u.id === userItem.id ? { ...u, is_active: newStatus } : u));
            showToast(`User ${userItem.full_name || userItem.email} status updated to ${newStatus ? 'Active' : 'Inactive'}`, "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to update user status.", "error");
        }
    };

    const handleRoleChange = async (userItem, roleId, roleName) => {
        try {
            await updateUserRole(userItem.id, roleId);
            setUsers((prev) => prev.map((u) => u.id === userItem.id ? { ...u, role: roleName, role_id: roleId } : u));
            setEditingUserId(null);
            showToast(`User ${userItem.full_name} role updated to ${roleName}`, "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to update user role.", "error");
        }
    };

    return (
        <MainLayout>
            <div className="user-management-page">
                <Breadcrumb items={[{ label: "Admin Dashboard", path: "/admin/dashboard" }, { label: "User Management" }]} />

                <div className="page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Manage user accounts, assigned roles, and platform permissions.</p>
                    </div>
                    <button type="button" className="btn-primary" onClick={() => showToast("Public registration is restricted to Learner. Privileged accounts are managed here.", "info")}>
                        <FaUserPlus /> User Control
                    </button>
                </div>

                {error && <div className="empty-state">{error}</div>}

                <div className="stats-grid">
                    {stats.map((s) => (
                        <div key={s.title} className="stat-card">
                            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
                            <div>
                                <h2>{s.value}</h2>
                                <h4>{s.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="filters-toolbar">
                    <div className="search-input-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-select-group">
                        <label className="filter-label">
                            <FaFilter /> Role
                            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="all">All Roles</option>
                                <option value="learner">Learner</option>
                                <option value="debate coach">Debate Coach</option>
                                <option value="educator">Educator</option>
                                <option value="administrator">Administrator</option>
                            </select>
                        </label>

                        <label className="filter-label">
                            Status
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="users-table-card">
                    {loading ? (
                        <div className="empty-state">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="empty-state">No users match your criteria.</div>
                    ) : (
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id || u.email}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar">{u.full_name?.charAt(0).toUpperCase() || "U"}</div>
                                                    <strong>{u.full_name || "Platform User"}</strong>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                {editingUserId === u.id ? (
                                                    <select
                                                        defaultValue={u.role_id || 1}
                                                        onChange={(e) => {
                                                            const rid = Number(e.target.value);
                                                            const rName = rid === 1 ? "Learner" : rid === 2 ? "Debate Coach" : rid === 3 ? "Educator" : "Administrator";
                                                            void handleRoleChange(u, rid, rName);
                                                        }}
                                                    >
                                                        <option value={1}>Learner</option>
                                                        <option value={2}>Debate Coach</option>
                                                        <option value={3}>Educator</option>
                                                        <option value={4}>Administrator</option>
                                                    </select>
                                                ) : (
                                                    <span className="role-badge">{u.role || u.role_name || "User"}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${u.is_active !== false ? "active" : "inactive"}`}>
                                                    {u.is_active !== false ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>{formatDate(u.created_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button type="button" className="btn-sm" onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)}>
                                                        {editingUserId === u.id ? "Cancel" : "Edit Role"}
                                                    </button>
                                                    <button type="button" className="btn-sm danger" onClick={() => void handleToggleStatus(u)}>
                                                        {u.is_active !== false ? "Deactivate" : "Activate"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default UserManagement;
