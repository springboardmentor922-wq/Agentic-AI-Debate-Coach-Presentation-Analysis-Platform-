import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, UserPlus, Trash2, Ban, CheckCircle, Eye, ArrowLeft } from 'lucide-react';
import { CreateUserModal } from './CreateUserModal';
import { UserProfileModal } from './UserProfileModal';

export const UserManagement = ({ filterRole = 'ALL', onNavigate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(filterRole || 'ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectUser, setInspectUser] = useState(null);

  useEffect(() => {
    if (filterRole) {
      setSelectedRoleFilter(filterRole);
    }
  }, [filterRole]);

  useEffect(() => {
    loadUsers();
  }, [selectedRoleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let data;
      if (selectedRoleFilter === 'ALL') {
        data = await api.getAllUsers();
      } else {
        data = await api.getUsersByRole(selectedRoleFilter);
      }
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, fullname) => {
    if (!confirm(`Are you sure you want to permanently delete ${fullname}?`)) return;
    try {
      const res = await api.deleteUser(userId);
      alert(res.message);
      loadUsers();
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
    try {
      const res = await api.updateUserStatus(user._id, newStatus);
      alert(res.message);
      loadUsers();
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Learner': return 'badge-learner';
      case 'Debate Coach': return 'badge-coach';
      case 'Educator': return 'badge-educator';
      case 'Admin': return 'badge-admin';
      default: return 'badge-learner';
    }
  };

  if (loading) {
    return <div className="glass-card p-10 text-center text-slate-400">Loading user directory...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {onNavigate && filterRole !== 'ALL' && (
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold gradient-text">User Directory</h2>
          <p className="text-slate-400 text-sm">Manage user access permissions, roles, and status.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="form-select text-xs py-2"
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="Learner">Learners</option>
            <option value="Debate Coach">Debate Coaches</option>
            <option value="Educator">Educators</option>
            <option value="Admin">Admins</option>
          </select>

          <button onClick={() => setShowCreateModal(true)} className="btn-primary text-xs">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-700/60">
              <tr>
                <th className="p-4">Full Name</th>
                <th className="p-4">Email / Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">No matching user accounts found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{u.fullname}</td>
                    <td className="p-4 text-xs text-slate-400">
                      <div>{u.email}</div>
                      <div className="font-mono text-indigo-400">@{u.username}</div>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${getRoleBadgeClass(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        u.status === 'Blocked'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setInspectUser(u)}
                        className="btn-secondary text-xs px-2.5 py-1.5"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold ${
                          u.status === 'Blocked'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                        title="Toggle Active/Block"
                      >
                        {u.status === 'Blocked' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.fullname)}
                        className="btn-danger text-xs px-2.5 py-1.5"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          loadUsers();
        }}
      />

      {inspectUser && (
        <UserProfileModal
          user={inspectUser}
          onClose={() => setInspectUser(null)}
          onDeleted={() => {
            setInspectUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};
