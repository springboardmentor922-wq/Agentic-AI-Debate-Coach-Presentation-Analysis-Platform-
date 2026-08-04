import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function AdminSecurityCompliance() {
  const [info, setInfo] = useState(null);
  useEffect(() => { api.get("/admin/security-info").then((res) => setInfo(res.data)).catch(() => {}); }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Security & Compliance</h2>
      {info && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-xl space-y-3">
          <p><span className="text-gray-500">Total Users:</span> {info.totalUsers}</p>
          <p><span className="text-gray-500">Password Hashing:</span> {info.passwordHashing}</p>
          <p><span className="text-gray-500">Session Token Expiry:</span> {info.sessionTokenExpiry}</p>
          <p><span className="text-gray-500">Multi-Factor Auth:</span> <span className="text-orange-400">{info.mfa}</span></p>
          <p><span className="text-gray-500">SSL/TLS:</span> <span className="text-orange-400">{info.sslTls}</span></p>
          <p className="text-gray-500 text-xs pt-3 border-t border-white/5">{info.note}</p>
        </div>
      )}
    </Layout>
  );
}
export default AdminSecurityCompliance;
