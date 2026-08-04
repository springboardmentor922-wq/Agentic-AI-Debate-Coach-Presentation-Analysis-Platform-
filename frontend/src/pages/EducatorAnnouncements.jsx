import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function EducatorAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState("");
  const [classId, setClassId] = useState("");

  const load = () => api.get("/educator/announcements").then((res) => setAnnouncements(res.data)).catch(() => {});
  useEffect(() => {
    load();
    api.get("/educator/classes").then((res) => setClasses(res.data)).catch(() => {});
  }, []);

  const handlePost = async () => {
    if (!message.trim()) return;
    await api.post("/educator/announcements", { message, classId: classId || null }).catch(() => {});
    setMessage(""); setClassId("");
    load();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Announcements</h2>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write an announcement..."
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm min-h-[80px]" />
        <button onClick={handlePost} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
          Post Announcement
        </button>
      </div>

      <div className="space-y-3 max-w-2xl">
        {announcements.map((a) => (
          <div key={a._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-200">{a.message}</p>
            <p className="text-gray-500 text-xs mt-2">{a.classId ? a.classId.name : "All classes"} · {new Date(a.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-gray-500">No announcements yet.</p>}
      </div>
    </Layout>
  );
}
export default EducatorAnnouncements;
