import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function AdminNotificationCenter() {
  const [notices, setNotices] = useState([]);
  const [message, setMessage] = useState("");

  const load = () => api.get("/admin/notices").then((res) => setNotices(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!message.trim()) return;
    await api.post("/admin/notices", { message }).catch(() => {});
    setMessage("");
    load();
  };

  const deactivate = async (id) => {
    await api.put(`/admin/notices/${id}/deactivate`).catch(() => {});
    load();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Notification Center</h2>
      <p className="text-gray-500 mb-6 max-w-2xl">Broadcast a real platform-wide message. Currently visible on this page only — say the word if you want it surfaced in every role's Notifications feed too.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="System-wide announcement..."
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm min-h-[80px]" />
        <button onClick={handlePost} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
          Broadcast
        </button>
      </div>

      <div className="space-y-3 max-w-2xl">
        {notices.map((n) => (
          <div key={n._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-4 flex justify-between items-start">
            <div><p className="text-gray-200 text-sm">{n.message}</p><p className="text-gray-500 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p></div>
            <button onClick={() => deactivate(n._id)} className="text-gray-500 hover:text-red-400 text-xs shrink-0 ml-3">Deactivate</button>
          </div>
        ))}
        {notices.length === 0 && <p className="text-gray-500">No active notices.</p>}
      </div>
    </Layout>
  );
}
export default AdminNotificationCenter;
