import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function AdminSystemHealth() {
  const [health, setHealth] = useState(null);
  useEffect(() => { api.get("/admin/system-health").then((res) => setHealth(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">System Settings — Health</h2>
      <p className="text-gray-500 mb-6 max-w-2xl">Real, live-pinged status where a subsystem actually exists. No fake green checkmarks — items with no real subsystem behind them say so honestly.</p>

      {health && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-xl">
          {Object.entries(health).map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
              <span className="text-gray-300 text-sm">{k}</span>
              <span className={`text-sm font-medium ${v === "Operational" ? "text-green-400" : v === "Down" ? "text-red-400" : "text-gray-500"}`}>
                {v === "Operational" ? "● Operational" : v === "Down" ? "● Down" : v}
              </span>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
export default AdminSystemHealth;
