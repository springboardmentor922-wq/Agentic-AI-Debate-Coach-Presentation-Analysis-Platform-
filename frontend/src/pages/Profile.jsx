import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { getUser } from "../utils/useAuth";

function Profile() {
  const user = getUser();
  const role = user?.role?.toLowerCase();

  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [savingCoach, setSavingCoach] = useState(false);

  const loadProfile = () => {
    api.get("/profile/me")
      .then((res) => {
        setMe(res.data);
        setSelectedCoach(res.data.assignedCoach?._id || "");
      })
      .catch(() => setError("Could not load your profile."));
  };

  useEffect(() => {
    loadProfile();
    if (role === "learner") {
      api.get("/coaches").then((res) => setCoaches(res.data)).catch(() => {});
    }
  }, []);

  const handleChooseCoach = async () => {
    setSavingCoach(true);
    try {
      await api.put("/learner/choose-coach", { coachId: selectedCoach || null });
      loadProfile();
    } catch {
      alert("Failed to update your coach");
    } finally {
      setSavingCoach(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>

      {error && <p className="text-red-400">{error}</p>}

      {me && (
        <div className="space-y-6 max-w-md">

          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 space-y-3">
            <p><span className="text-gray-500">Name:</span> {me.name}</p>
            <p><span className="text-gray-500">Email:</span> {me.email}</p>
            <p><span className="text-gray-500">Role:</span> {me.role}</p>
            <p><span className="text-gray-500">Experience:</span> {me.experience}</p>
            {me.createdAt && (
              <p><span className="text-gray-500">Member since:</span> {new Date(me.createdAt).toLocaleDateString()}</p>
            )}
          </div>

          {/* ---- LEARNER: choose your own coach ---- */}
          {role === "learner" && (
            <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">🧑‍🏫 My Coach</h3>

              {me.assignedCoach ? (
                <p className="text-gray-300 text-sm mb-4">
                  Currently mentored by <span className="font-medium">{me.assignedCoach.name}</span>{" "}
                  ({me.assignedCoach.experience})
                </p>
              ) : (
                <p className="text-gray-500 text-sm mb-4">No coach selected yet.</p>
              )}

              <select
                value={selectedCoach}
                onChange={(e) => setSelectedCoach(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-4"
              >
                <option value="">No coach</option>
                {coaches.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} — {c.experience}</option>
                ))}
              </select>

              <button
                onClick={handleChooseCoach}
                disabled={savingCoach}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white font-semibold px-5 py-2 rounded-lg text-sm"
              >
                {savingCoach ? "Saving..." : "Save Coach"}
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default Profile;
