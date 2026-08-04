import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import { getUser } from "../utils/useAuth";

function CoachReports() {
  const [searchParams] = useSearchParams();
  const [learners, setLearners] = useState([]);
  const [learnerId, setLearnerId] = useState(searchParams.get("learner") || "");
  const [sessions, setSessions] = useState([]);
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    api.get("/coach/learners").then((res) => setLearners(res.data)).catch(() => {});
  }, []);

  const loadSessions = (id) => {
    setLearnerId(id);
    if (!id) return;
    api.get(`/coach/learner/${id}/sessions`).then((res) => setSessions(res.data)).catch(() => {});
  };

  useEffect(() => { if (learnerId) loadSessions(learnerId); }, []);

  const submitReview = async (sessionId) => {
    try {
      await api.put(`/coach/session/${sessionId}/review`, { coachFeedback: drafts[sessionId] || "" });
      loadSessions(learnerId);
    } catch { alert("Failed to submit feedback"); }
  };

  const exportCsv = async () => {
    const res = await api.get("/coach/export-csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "coach_report.csv";
    link.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reports — Review Learner Sessions</h2>
        <button onClick={exportCsv} className="bg-[#1a1a2b] border border-white/10 hover:border-purple-500 transition text-gray-300 text-sm font-medium px-4 py-2 rounded-lg">
          📤 Export CSV
        </button>
      </div>

      <select value={learnerId} onChange={(e) => loadSessions(e.target.value)} className="bg-[#1a1a2b] border border-white/10 rounded-lg px-4 py-3 mb-6">
        <option value="">Select a learner</option>
        {learners.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
      </select>

      {learnerId && sessions.length === 0 && <p className="text-gray-500">This learner has no sessions yet.</p>}

      <div className="space-y-4">
        {sessions.map((s) => (
          <div key={s._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <p className="font-semibold">{s.topic} <span className="text-gray-500 font-normal">({s.stance})</span></p>
            <p className="text-gray-400 text-sm my-2">{s.argument}</p>
            <p className="text-sm text-gray-500 mb-3">
              Comm {s.communicationScore}% · Arg {s.argumentScore}% · Conf {s.confidenceScore}%
            </p>
            {s.reviewedByCoach ? (
              <p className="text-green-400 text-sm">✔ Reviewed — "{s.coachFeedback}"</p>
            ) : (
              <>
                <textarea placeholder="Write feedback for this session..." className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-3 text-sm"
                  value={drafts[s._id] || ""} onChange={(e) => setDrafts({ ...drafts, [s._id]: e.target.value })} />
                <button onClick={() => submitReview(s._id)} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg">
                  Submit Feedback
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EducatorReports() {
  const [overview, setOverview] = useState(null);
  useEffect(() => { api.get("/educator/overview").then((res) => setOverview(res.data)).catch(() => {}); }, []);

  const exportCsv = async () => {
    const res = await api.get("/educator/export-csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "educator_report.csv";
    link.click();
  };

  if (!overview) return <p className="text-gray-500">Loading...</p>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reports — Group Performance</h2>
        <button onClick={exportCsv} className="bg-[#1a1a2b] border border-white/10 hover:border-purple-500 transition text-gray-300 text-sm font-medium px-4 py-2 rounded-lg">
          📤 Export CSV
        </button>
      </div>
      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
        <p className="mb-2">📈 Average Score: {overview.averageScore}%</p>
        <p className="mb-2">👥 Total Learners: {overview.totalLearners}</p>
        <p className="mb-2">🗂️ Total Sessions: {overview.totalSessions}</p>
        <p>🏆 Top Performer: {overview.topPerformer}</p>
      </div>
    </div>
  );
}

function AdminReports() {
  const [overview, setOverview] = useState(null);
  useEffect(() => { api.get("/admin/overview").then((res) => setOverview(res.data)).catch(() => {}); }, []);

  const exportCsv = async () => {
    const res = await api.get("/admin/export-csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "platform_report.csv";
    link.click();
  };

  if (!overview) return <p className="text-gray-500">Loading...</p>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reports & Logs — System Overview</h2>
        <button onClick={exportCsv} className="bg-[#1a1a2b] border border-white/10 hover:border-purple-500 transition text-gray-300 text-sm font-medium px-4 py-2 rounded-lg">
          📤 Export Platform CSV
        </button>
      </div>
      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
        <p className="mb-2">Total Users: {overview.counts.totalUsers}</p>
        <p className="mb-2">Learners: {overview.counts.learners}</p>
        <p className="mb-2">Coaches: {overview.counts.coaches}</p>
        <p>Educators: {overview.counts.educators}</p>
      </div>
    </div>
  );
}

function Reports() {
  const user = getUser();
  const role = user?.role?.toLowerCase();
  let content;
  if (role === "debate coach") content = <CoachReports />;
  else if (role === "educator") content = <EducatorReports />;
  else if (role === "admin") content = <AdminReports />;
  else content = <p className="text-gray-500">Reports are available to Coaches, Educators, and Admins.</p>;
  return <Layout>{content}</Layout>;
}

export default Reports;
