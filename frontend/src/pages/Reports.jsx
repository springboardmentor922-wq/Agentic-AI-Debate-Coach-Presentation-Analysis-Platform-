import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
import { Search, MessageSquare, Swords, Trophy, Timer, Users, Clock, BookOpen } from "lucide-react";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import { sessionApi, reportsApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import FeedbackModal from "../components/FeedbackModal";
import CoachingPlanCard from "../components/CoachingPlanCard";
import CounterargumentSummaryCard from "../components/CounterargumentSummaryCard";

const COLORS = { scheduled: "#F4B740", in_progress: "#3FBFAE", completed: "#8B93A7", cancelled: "#E8543F" };

function formatRelativeTime(isoString) {
  if (!isoString) return "Not active yet";
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function formatPersonalStat(value) {
  if (value === 0) return "Not started";
  return value;
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        active ? "bg-motion-teal text-ink-900" : "border border-white/10 text-slate-muted hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function Disclaimer({ context }) {
  return (
    <div className="card p-5 text-sm text-slate-muted mt-8">
      Skill-level analytics (argument strength, fallacy frequency, delivery pacing) will populate
      once the AI analysis engine ships. This view currently reflects {context} stored during
      Milestone 1.
    </div>
  );
}

function MyActivityView({ isOrgRole }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [ctrSummary, setCtrSummary] = useState(null);
  const [ctrLoading, setCtrLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await sessionApi.list();
      setSessions(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await reportsApi.myRecommendations();
        setPlan(data);
      } catch {
        // coaching plan is supplementary — the rest of the Reports page still works without it
      } finally {
        setPlanLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await reportsApi.counterargumentSummary();
        setCtrSummary(data);
      } catch {
        // supplementary — rest of the page still works without it
      } finally {
        setCtrLoading(false);
      }
    })();
  }, []);

  const statusBreakdown = useMemo(() => {
    const counts = {};
    sessions.forEach((s) => (counts[s.status] = (counts[s.status] || 0) + 1));
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [sessions]);

  const stanceBreakdown = useMemo(() => {
    const counts = { for: 0, against: 0 };
    sessions.forEach((s) => {
      if (counts[s.stance] !== undefined) counts[s.stance] += 1;
    });
    return [
      { name: "For", value: counts.for, color: "#3FBFAE" },
      { name: "Against", value: counts.against, color: "#E8543F" },
    ];
  }, [sessions]);

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.status === "completed" ? s.duration_minutes : 0), 0);

  return (
    <div>
      {isOrgRole && (
        <p className="text-xs text-slate-muted mb-6 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          This tab shows your own personal activity only — not aggregated data from other users.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Sessions Logged" value={formatPersonalStat(sessions.length)} icon={Swords} accent="teal" />
        <StatCard
          label="Completed"
          value={formatPersonalStat(sessions.filter((s) => s.status === "completed").length)}
          icon={Trophy}
          accent="amber"
        />
        <StatCard label="Minutes Practiced" value={formatPersonalStat(totalMinutes)} icon={Timer} accent="coral" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <p className="label-eyebrow mb-4">Sessions by status</p>
          {loading ? (
            <p className="text-slate-muted text-sm">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="text-slate-muted text-sm">No sessions logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="status" stroke="#8B93A7" fontSize={12} tickLine={false} />
                <YAxis stroke="#8B93A7" fontSize={12} allowDecimals={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1A2233", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.status] || "#3FBFAE"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <p className="label-eyebrow mb-4">Stance distribution</p>
          {loading ? (
            <p className="text-slate-muted text-sm">Loading…</p>
          ) : sessions.length === 0 ? (
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

      {!planLoading && plan && <CoachingPlanCard plan={plan} />}

      {!ctrLoading && ctrSummary && <CounterargumentSummaryCard summary={ctrSummary} />}

      <Disclaimer context="your personal session activity" />
    </div>
  );
}

function AllLearnersView() {
  const [report, setReport] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await reportsApi.allLearners();
      setReport(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!report) return [];
    return report.learners.filter((l) => l.full_name.toLowerCase().includes(query.toLowerCase()));
  }, [report, query]);

  if (loading) return <p className="text-slate-muted text-sm">Loading…</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Learners" value={report.total_learners} icon={Users} accent="teal" />
        <StatCard label="Sessions This Week" value={report.sessions_this_week} icon={Swords} accent="amber" />
        <StatCard
          label="Avg Completion Rate"
          value={report.avg_completion_rate === null ? "No sessions yet" : `${report.avg_completion_rate}%`}
          icon={Trophy}
          accent="coral"
        />
        <StatCard
          label="Most Debated Topic"
          value={report.most_debated_topic || "None yet"}
          icon={Swords}
          accent="teal"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg">Learner activity</h2>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" />
            <input
              className="input-field pl-9 py-1.5 text-sm"
              placeholder="Search learners…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-muted text-sm">No learners found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-muted border-b border-white/5">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Sessions</th>
                <th className="px-6 py-3 font-medium">Completed</th>
                <th className="px-6 py-3 font-medium">Last active</th>
                <th className="px-6 py-3 font-medium">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3 font-semibold">
                    <Link to={`/reports/user/${l.id}`} className="text-motion-teal hover:underline">
                      {l.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{formatPersonalStat(l.sessions)}</td>
                  <td className="px-6 py-3">{formatPersonalStat(l.completed)}</td>
                  <td className="px-6 py-3 text-slate-muted">{formatRelativeTime(l.last_active)}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => setFeedbackTarget(l)}
                      className="text-xs text-motion-teal hover:underline inline-flex items-center gap-1"
                    >
                      <MessageSquare size={12} /> View feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {feedbackTarget && (
        <FeedbackModal
          targetUserId={feedbackTarget.id}
          targetUserName={feedbackTarget.full_name}
          onClose={() => setFeedbackTarget(null)}
        />
      )}

      <Disclaimer context="learner session counts" />
    </div>
  );
}

function CoachesView() {
  const [report, setReport] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await reportsApi.coaches();
      setReport(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!report) return [];
    return report.coaches.filter((c) => c.full_name.toLowerCase().includes(query.toLowerCase()));
  }, [report, query]);

  if (loading) return <p className="text-slate-muted text-sm">Loading…</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Coaches" value={report.active_coaches} icon={Users} accent="teal" />
        <StatCard label="Sessions Coached" value={report.sessions_coached} icon={Swords} accent="amber" />
        <StatCard label="Feedback Given" value={report.feedback_given} icon={MessageSquare} accent="coral" />
        <StatCard label="Avg Response Time" value="Not tracked yet" icon={Clock} accent="teal" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg">Coach activity</h2>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" />
            <input
              className="input-field pl-9 py-1.5 text-sm"
              placeholder="Search coaches…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-muted text-sm">No coaches found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-muted border-b border-white/5">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Sessions coached</th>
                <th className="px-6 py-3 font-medium">Feedback given</th>
                <th className="px-6 py-3 font-medium">Learners assigned</th>
                <th className="px-6 py-3 font-medium">Last active</th>
                <th className="px-6 py-3 font-medium">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3 font-semibold">
                    <Link to={`/reports/user/${c.id}`} className="text-motion-teal hover:underline">
                      {c.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{formatPersonalStat(c.sessions_coached)}</td>
                  <td className="px-6 py-3">{formatPersonalStat(c.feedback_given)}</td>
                  <td className="px-6 py-3">{formatPersonalStat(c.learners_assigned)}</td>
                  <td className="px-6 py-3 text-slate-muted">{formatRelativeTime(c.last_active)}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => setFeedbackTarget(c)}
                      className="text-xs text-motion-teal hover:underline inline-flex items-center gap-1"
                    >
                      <MessageSquare size={12} /> View feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {feedbackTarget && (
        <FeedbackModal
          targetUserId={feedbackTarget.id}
          targetUserName={feedbackTarget.full_name}
          onClose={() => setFeedbackTarget(null)}
        />
      )}

      <Disclaimer context="coaching session counts" />
    </div>
  );
}

function EducatorsView() {
  const [report, setReport] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await reportsApi.educators();
      setReport(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!report) return [];
    return report.educators.filter((e) => e.full_name.toLowerCase().includes(query.toLowerCase()));
  }, [report, query]);

  if (loading) return <p className="text-slate-muted text-sm">Loading…</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Educators" value={report.active_educators} icon={Users} accent="teal" />
        <StatCard label="Topics Published" value={report.topics_published} icon={BookOpen} accent="amber" />
        <StatCard label="Sessions Generated" value={report.sessions_generated} icon={Swords} accent="coral" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg">Educator activity</h2>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" />
            <input
              className="input-field pl-9 py-1.5 text-sm"
              placeholder="Search educators…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-muted text-sm">No educators found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-muted border-b border-white/5">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Topics published</th>
                <th className="px-6 py-3 font-medium">Sessions generated</th>
                <th className="px-6 py-3 font-medium">Last active</th>
                <th className="px-6 py-3 font-medium">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3 font-semibold">
                    <Link to={`/reports/user/${e.id}`} className="text-motion-teal hover:underline">
                      {e.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{formatPersonalStat(e.topics_published)}</td>
                  <td className="px-6 py-3">{formatPersonalStat(e.sessions_generated)}</td>
                  <td className="px-6 py-3 text-slate-muted">{formatRelativeTime(e.last_active)}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => setFeedbackTarget(e)}
                      className="text-xs text-motion-teal hover:underline inline-flex items-center gap-1"
                    >
                      <MessageSquare size={12} /> View feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {feedbackTarget && (
        <FeedbackModal
          targetUserId={feedbackTarget.id}
          targetUserName={feedbackTarget.full_name}
          onClose={() => setFeedbackTarget(null)}
        />
      )}

      <Disclaimer context="educator topic and session activity" />
    </div>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isOrgRole = user?.role === "administrator";
  const validTabs = ["all_learners", "coaches", "educators", "my_activity"];
  const requestedTab = searchParams.get("tab");
  const initialTab = isOrgRole && validTabs.includes(requestedTab) ? requestedTab : isOrgRole ? "all_learners" : "my_activity";

  const [tab, setTab] = useState(initialTab);

  const changeTab = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="label-eyebrow mb-1">Reports</p>
            <h1 className="font-display text-3xl">
              {isOrgRole ? "Platform reports" : "Your progress"}
            </h1>
          </div>

          {isOrgRole && (
            <div className="flex gap-2">
              <TabButton active={tab === "all_learners"} onClick={() => changeTab("all_learners")}>
                All learners
              </TabButton>
              <TabButton active={tab === "coaches"} onClick={() => changeTab("coaches")}>
                Debate coach
              </TabButton>
              <TabButton active={tab === "educators"} onClick={() => changeTab("educators")}>
                Educator
              </TabButton>
              <TabButton active={tab === "my_activity"} onClick={() => changeTab("my_activity")}>
                My activity
              </TabButton>
            </div>
          )}
        </div>

        {!isOrgRole && <MyActivityView isOrgRole={false} />}
        {isOrgRole && tab === "all_learners" && <AllLearnersView />}
        {isOrgRole && tab === "coaches" && <CoachesView />}
        {isOrgRole && tab === "educators" && <EducatorsView />}
        {isOrgRole && tab === "my_activity" && <MyActivityView isOrgRole={true} />}
      </div>
    </AppShell>
  );
}