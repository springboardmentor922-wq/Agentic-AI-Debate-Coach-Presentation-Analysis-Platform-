import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function AdminTopActiveDebates() {
  const [debates, setDebates] = useState([]);
  useEffect(() => { api.get("/admin/top-active-debates").then((res) => setDebates(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Debate Sessions</h2>
      <p className="text-gray-500 mb-6">Top active debate topics, ranked by real session count. Live session monitoring isn't built — this project has no live-session infrastructure.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-3xl">
        <table className="w-full text-left text-sm">
          <thead><tr className="text-gray-400 border-b border-white/10"><th className="py-2">Topic</th><th className="py-2">Sessions</th></tr></thead>
          <tbody>
            {debates.map((d, i) => (
              <tr key={d.topic} className="border-b border-white/5">
                <td className="py-3">#{i + 1} {d.topic}</td>
                <td className="py-3 text-purple-400 font-semibold">{d.sessionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {debates.length === 0 && <p className="text-gray-500 mt-4">No sessions yet.</p>}
      </div>
    </Layout>
  );
}
export default AdminTopActiveDebates;
