import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const load = () => api.get("/admin/support-tickets").then((res) => setTickets(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const resolve = async (id) => {
    await api.put(`/admin/support-tickets/${id}/resolve`).catch(() => {});
    load();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Feedback & Support</h2>
      <div className="space-y-3 max-w-3xl">
        {tickets.map((t) => (
          <div key={t._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold">{t.subject}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${t.status === "Open" ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}>{t.status}</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">{t.message}</p>
            <p className="text-gray-500 text-xs mb-3">{t.userId?.name} ({t.userId?.role}) · {new Date(t.createdAt).toLocaleString()}</p>
            {t.status === "Open" && (
              <button onClick={() => resolve(t._id)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-4 py-2 rounded-lg">
                Mark Resolved
              </button>
            )}
          </div>
        ))}
        {tickets.length === 0 && <p className="text-gray-500">No tickets submitted yet.</p>}
      </div>
    </Layout>
  );
}
export default AdminSupportTickets;
