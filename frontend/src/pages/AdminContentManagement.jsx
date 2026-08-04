import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function AdminContentManagement() {
  const [topics, setTopics] = useState([]);
  const [resources, setResources] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [tab, setTab] = useState("Topics");

  const loadAll = () => {
    api.get("/topics").then((res) => setTopics(res.data)).catch(() => {});
    api.get("/admin/resources").then((res) => setResources(res.data)).catch(() => {});
    api.get("/admin/rubrics").then((res) => setRubrics(res.data)).catch(() => {});
  };
  useEffect(() => { loadAll(); }, []);

  const deleteTopic = async (id) => { await api.delete(`/admin/topics/${id}`).catch(() => {}); loadAll(); };
  const deleteResource = async (id) => { await api.delete(`/admin/resources/${id}`).catch(() => {}); loadAll(); };
  const deleteRubric = async (id) => { await api.delete(`/admin/rubrics/${id}`).catch(() => {}); loadAll(); };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Content Management</h2>

      <div className="flex gap-2 mb-6">
        {["Topics", "Resources", "Rubrics"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? "bg-purple-600 text-white" : "bg-[#1a1a2b] text-gray-400 border border-white/10"}`}>{t}</button>
        ))}
      </div>

      {tab === "Topics" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
          {topics.map((t) => (
            <div key={t._id} className="bg-[#1a1a2b] border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <div><p className="text-sm">{t.title}</p><p className="text-gray-500 text-xs">{t.format} · {t.difficulty}</p></div>
              <button onClick={() => deleteTopic(t._id)} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
            </div>
          ))}
          {topics.length === 0 && <p className="text-gray-500">No topics.</p>}
        </div>
      )}

      {tab === "Resources" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
          {resources.map((r) => (
            <div key={r._id} className="bg-[#1a1a2b] border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <div><p className="text-sm">{r.title}</p><p className="text-gray-500 text-xs">{r.type} · added by {r.addedBy?.name}</p></div>
              <button onClick={() => deleteResource(r._id)} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
            </div>
          ))}
          {resources.length === 0 && <p className="text-gray-500">No resources.</p>}
        </div>
      )}

      {tab === "Rubrics" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
          {rubrics.map((r) => (
            <div key={r._id} className="bg-[#1a1a2b] border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <div><p className="text-sm">{r.title}</p><p className="text-gray-500 text-xs">by {r.educatorId?.name} · {r.criteria.length} criteria</p></div>
              <button onClick={() => deleteRubric(r._id)} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
            </div>
          ))}
          {rubrics.length === 0 && <p className="text-gray-500">No rubrics.</p>}
        </div>
      )}
    </Layout>
  );
}
export default AdminContentManagement;
