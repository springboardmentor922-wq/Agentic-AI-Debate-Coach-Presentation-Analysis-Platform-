import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import RoleBadge from "../components/RoleBadge";
import { reportsApi } from "../api/endpoints";
import { Swords, Trophy, Timer } from "lucide-react";
import FeedbackModal from "../components/FeedbackModal";
import { LineChart, Line } from "recharts";

const COLORS = { scheduled: "#F4B740", in_progress: "#3FBFAE", completed: "#8B93A7", cancelled: "#E8543F" };

function formatStat(value) {
  return value === 0 ? "Not started" : value;
}

export default function UserActivityDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await reportsApi.userActivity(userId);
        setData(data);
      } catch (err) {
        setError(err.response?.data?.detail || "You don't have permission to view this.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const statusBreakdown = useMemo(() => {
    if (!data) return [];
    const counts = {};
    data.sessions.forEach((s) => (counts[s.status] = (counts[s.status] || 0) + 1));
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [data]);

  const stanceBreakdown = useMemo(() => {
    if (!data) return [];
    const counts = { for: 0, against: 0 };
    data.sessions.forEach((s) => {
      if (counts[s.stance] !== undefined) counts[s.stance] += 1;
    });
    return [
      { name: "For", value: counts.for, color: "#3FBFAE" },
      { name: "Against", value: counts.against, color: "#E8543F" },
    ];
  }, [data]);

  const improvementTrend = useMemo(() => {
    if (!data) return [];
    const weeks = {};
    data.sessions.forEach((s) => {
      if (s.status !== "completed") return;
      const d = new Date(s.created_at);
      const weekLabel = `${d.getMonth() + 1}/${d.getDate()}`;
      weeks[weekLabel] = (weeks[weekLabel] || 0) + 1;
    });
    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  }, [data]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-10 text-slate-muted text-sm">Loading…</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-8 py-10">
          <p className="text-sm text-rebuttal-coral bg-rebuttal-coral/10 border border-rebuttal-coral/30 rounded-lg px-4 py-3">
            {error}
          </p>
        </div>
      </AppShell>
    );
  }

  const totalMinutes = data.sessions.reduce((sum, s) => sum + (s.status === "completed" ? s.duration_minutes : 0), 0);


  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-muted hover:text-fog mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl">{data.user.full_name}</h1>
            <RoleBadge role={data.user.role} />
          </div>
          <button onClick={() => setShowFeedback(true)} className="btn-secondary">
            View feedback
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard label="Sessions Logged" value={formatStat(data.sessions.length)} icon={Swords} accent="teal" />
          <StatCard
            label="Completed"
            value={formatStat(data.sessions.filter((s) => s.status === "completed").length)}
            icon={Trophy}
            accent="amber"
          />
          <StatCard label="Minutes Practiced" value={formatStat(totalMinutes)} icon={Timer} accent="coral" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 mt-6">
          <p className="label-eyebrow mb-4">
            Improvement trend (completed sessions over time — a proxy until skill scoring ships)
          </p>
          {improvementTrend.length === 0 ? (
            <p className="text-slate-muted text-sm">No completed sessions yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={improvementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="#8B93A7" fontSize={12} tickLine={false} />
                <YAxis stroke="#8B93A7" fontSize={12} allowDecimals={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1A2233", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#3FBFAE" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {showFeedback && (
          <FeedbackModal
            targetUserId={data.user.id}
            targetUserName={data.user.full_name}
            onClose={() => setShowFeedback(false)}
          />
        )}

          <div className="card p-6">
            <p className="label-eyebrow mb-4">Stance distribution</p>
            {data.sessions.length === 0 ? (
              <p className="text-slate-muted text-sm">No sessions logged yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stanceBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {stanceBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1A2233", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}