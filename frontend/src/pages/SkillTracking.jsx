import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SkillProgress from "../components/SkillProgress";
import api from "../api/axios";
import { getUser } from "../utils/useAuth";

function SkillTracking() {
  const user = getUser();
  const role = user?.role?.toLowerCase();

  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");

  useEffect(() => {
    if (role === "learner") return;

    const endpoint =
      role === "debate coach" ? "/coach/learners" :
      role === "educator" ? "/educator/overview" :
      role === "admin" ? "/admin/overview" : null;

    if (!endpoint) return;

    api.get(endpoint).then((res) => {
      if (role === "debate coach") setLearners(res.data);
      else if (role === "educator") setLearners(res.data.learners);
      else if (role === "admin") setLearners(res.data.users.filter((u) => u.role === "Learner"));
    }).catch(() => {});
  }, [role]);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Skill Tracking</h2>

      {role === "learner" ? (
        <SkillProgress userId={user.id} />
      ) : (
        <div>
          <select
            className="bg-[#1a1a2b] border border-white/10 rounded-lg px-4 py-3 mb-6"
            value={selectedLearner}
            onChange={(e) => setSelectedLearner(e.target.value)}
          >
            <option value="">Select a learner</option>
            {learners.map((l) => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>

          {selectedLearner ? (
            <SkillProgress userId={selectedLearner} />
          ) : (
            <p className="text-gray-500">Choose a learner above to view their progress chart.</p>
          )}
        </div>
      )}
    </Layout>
  );
}

export default SkillTracking;
