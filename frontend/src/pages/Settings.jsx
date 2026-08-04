import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

function Settings() {
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/profile/me").then((res) => { setMe(res.data); setName(res.data.name); }).catch(() => {});
  }, []);

  const saveName = async () => {
    try {
      await api.put("/profile/update", { name });
      const updated = JSON.parse(localStorage.getItem("user"));
      updated.name = name;
      localStorage.setItem("user", JSON.stringify(updated));
      setMsg("Profile updated.");
    } catch { setMsg("Failed to update profile."); }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) return;
    try {
      await api.put("/profile/password", { currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword("");
      setMsg("Password updated.");
    } catch (e) {
      setMsg(e.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      {msg && <p className="text-purple-400 mb-4">{msg}</p>}

      <div className="space-y-6 max-w-xl">

        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Profile Settings</h3>
          <label className="text-gray-500 text-xs mb-1 block">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3" />
          <button onClick={saveName} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Save
          </button>
        </div>

        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Account Settings</h3>
          <p className="text-gray-500 text-sm mb-3">Email: {me?.email}</p>
          <label className="text-gray-500 text-xs mb-1 block">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3" />
          <label className="text-gray-500 text-xs mb-1 block">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3" />
          <button onClick={changePassword} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Change Password
          </button>
        </div>

        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold mb-2">Notification Preferences</h3>
          <p className="text-gray-500 text-sm">
            Notifications are generated automatically from real events (upcoming scheduled sessions,
            coach feedback, and achievements) — visible on the Notifications page.
          </p>
        </div>

        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold mb-2">Privacy & Security</h3>
          <p className="text-gray-500 text-sm">
            Your password is hashed with bcrypt and never stored in plain text. Your session
            is authenticated with a signed JWT that expires after 1 day.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
