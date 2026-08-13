import { useEffect, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell";
import { adminApi } from "../api/endpoints";

const ROLES = ["learner", "debate_coach", "educator", "administrator"];

function ConfirmDeleteModal({ user, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-sm p-6">
        <h3 className="font-display text-lg mb-2">Delete this account?</h3>
        <p className="text-sm text-slate-muted mb-6">
          Permanently delete <span className="text-fog font-semibold">{user.full_name}</span>'s account?
          This cannot be undone — their profile and all debate sessions they created will be
          erased completely.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger flex-1">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function KebabMenu({ onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-md text-slate-muted hover:bg-white/5 hover:text-fog"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-36 card py-1 z-20">
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full text-left px-3 py-2 text-sm text-rebuttal-coral hover:bg-rebuttal-coral/10 flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUsers = async () => {
    const { data } = await adminApi.listUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    await adminApi.changeRole(userId, role);
    loadUsers();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.is_active ? "disabled" : "active";
    await adminApi.setStatus(user.id, newStatus);
    loadUsers();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await adminApi.deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    loadUsers();
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="label-eyebrow mb-1">Administration</p>
        <h1 className="font-display text-3xl mb-8">User &amp; role management</h1>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-muted border-b border-white/5">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-muted">
                    Loading users…
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-3">{u.full_name}</td>
                    <td className="px-6 py-3 text-slate-muted">{u.email}</td>
                    <td className="px-6 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-ink-800 border border-white/10 rounded-lg px-2 py-1 text-xs"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      {u.is_active ? (
                        <span className="text-motion-teal text-xs font-mono uppercase">Active</span>
                      ) : (
                        <span className="text-rebuttal-coral text-xs font-mono uppercase">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs hover:underline ${
                            u.is_active ? "text-signal-amber" : "text-motion-teal"
                          }`}
                        >
                          {u.is_active ? "Deactivate" : "Enable"}
                        </button>
                        <KebabMenu onDelete={() => setDeleteTarget(u)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          user={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </AppShell>
  );
}