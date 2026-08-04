import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get("/admin/audit-logs").then((res) => setLogs(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Audit Logs</h2>
      <p className="text-gray-500 mb-6">Real, immutable log of every sensitive admin action taken on the platform.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-3xl">
        <table className="w-full text-left text-sm">
          <thead><tr className="text-gray-400 border-b border-white/10"><th className="py-2">Admin</th><th className="py-2">Action</th><th className="py-2">Details</th><th className="py-2">When</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-b border-white/5">
                <td className="py-3">{l.adminName}</td>
                <td className="py-3">{l.action}</td>
                <td className="py-3 text-gray-400">{l.details}</td>
                <td className="py-3 text-gray-500">{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-gray-500 mt-4">No admin actions logged yet.</p>}
      </div>
    </Layout>
  );
}
export default AdminAuditLogs;
