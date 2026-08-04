import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { getUser } from "../utils/useAuth";

function FeedbackCoaching() {
  const user = getUser();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get(`/session/${user.id}`).then((res) => setSessions(res.data)).catch(() => {});
  }, []);

  // A session has feedback worth showing if it has AI feedback, real coach
  // feedback, or real educator feedback — all three are shown when present,
  // not just one picked over the others.
  const withFeedback = sessions.filter((s) => s.feedback || s.coachFeedback || s.educatorFeedback);
  const latest = withFeedback[0];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Feedback & Coaching</h2>

      {latest && (
        <div className="bg-[#1a1a2b] border border-purple-500/30 rounded-2xl p-6 max-w-2xl mb-6">
          <p className="text-gray-400 text-sm mb-3">Latest Session — {latest.topic} · {new Date(latest.createdAt).toLocaleDateString()}</p>

          {latest.coachFeedback && (
            <div className="mb-3">
              <p className="text-purple-400 text-xs font-semibold mb-1">FROM YOUR COACH</p>
              <p className="text-gray-200 italic">"{latest.coachFeedback}"</p>
            </div>
          )}
          {latest.educatorFeedback && (
            <div className="mb-3">
              <p className="text-blue-400 text-xs font-semibold mb-1">FROM YOUR EDUCATOR</p>
              <p className="text-gray-200 italic">"{latest.educatorFeedback}"</p>
            </div>
          )}
          {!latest.coachFeedback && !latest.educatorFeedback && latest.feedback && (
            <div>
              <p className="text-gray-500 text-xs font-semibold mb-1">AI FEEDBACK</p>
              <p className="text-gray-200 italic">"{latest.feedback}"</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 max-w-2xl">
        {withFeedback.slice(1).map((s) => (
          <div key={s._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-2">{s.topic} · {new Date(s.createdAt).toLocaleDateString()}</p>
            {s.coachFeedback && <p className="text-gray-300 text-sm mb-1"><span className="text-purple-400 text-xs">Coach:</span> {s.coachFeedback}</p>}
            {s.educatorFeedback && <p className="text-gray-300 text-sm mb-1"><span className="text-blue-400 text-xs">Educator:</span> {s.educatorFeedback}</p>}
            {!s.coachFeedback && !s.educatorFeedback && s.feedback && <p className="text-gray-300 text-sm">{s.feedback}</p>}
          </div>
        ))}
      </div>

      {withFeedback.length === 0 && <p className="text-gray-500">No feedback yet — complete a debate to get AI feedback.</p>}
    </Layout>
  );
}

export default FeedbackCoaching;
