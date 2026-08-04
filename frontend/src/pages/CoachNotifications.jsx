import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function CoachNotifications() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => { api.get("/coach/notifications").then((res) => setNotifications(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      <div className="space-y-3 max-w-2xl">
        {notifications.map((n) => (
          <div key={n.id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
            <p className="text-gray-200 text-sm">{n.text}</p>
            <p className="text-gray-500 text-xs shrink-0 ml-4">{new Date(n.timestamp).toLocaleString([], { month: "short", day: "numeric" })}</p>
          </div>
        ))}
        {notifications.length === 0 && <p className="text-gray-500">No pending reviews right now.</p>}
      </div>
    </Layout>
  );
}
export default CoachNotifications;
