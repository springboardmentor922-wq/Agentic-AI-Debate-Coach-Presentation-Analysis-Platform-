import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function AdminUserManagement() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const load = () => {
    api.get("/admin/overview").then((res) => setData(res.data)).catch(() => setError("Could not load user data."));
  };
  useEffect(() => { load(); }, []);

  const coaches = data ? data.users.filter((u) => u.role === "Debate Coach") : [];

  const handleAssign = async (learnerId, coachId) => {
    try {
      await api.put(`/admin/users/${learnerId}/assign-coach`, { coachId: coachId || null });
      load();
    } catch { alert("Failed to assign coach"); }
  };

  const filtered = data ? data.users.filter((u) =>
    (roleFilter === "All" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  ) : [];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!data ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
          <div className="flex gap-3 mb-4">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-2 text-sm" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-2 text-sm">
              <option>All</option><option>Learner</option><option>Debate Coach</option><option>Educator</option><option>Admin</option>
            </select>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="py-3 px-3 rounded-l-lg">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Experience</th>
                <th className="py-3 px-3 rounded-r-lg">Assigned Coach</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b border-white/5">
                  <td className="py-3 px-3">{u.name}</td>
                  <td className="py-3 px-3 text-gray-400">{u.email}</td>
                  <td className="py-3 px-3">{u.role}</td>
                  <td className="py-3 px-3">{u.experience}</td>
                  <td className="py-3 px-3">
                    {u.role === "Learner" ? (
                      <select value={u.assignedCoach || ""} onChange={(e) => handleAssign(u._id, e.target.value)}
                        className="bg-[#0f0f1a] border border-white/10 rounded-lg px-2 py-1 text-sm">
                        <option value="">Unassigned</option>
                        {coaches.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
export default AdminUserManagement;
