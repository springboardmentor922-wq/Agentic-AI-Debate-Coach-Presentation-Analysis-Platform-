import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { sessionApi } from "../api/endpoints";

const STATUS_STYLES = {
  scheduled: "bg-signal-amber/15 text-signal-amber",
  in_progress: "bg-motion-teal/15 text-motion-teal",
  completed: "bg-white/10 text-slate-muted",
  cancelled: "bg-rebuttal-coral/15 text-rebuttal-coral",
};

export default function SessionManagement() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadSessions = async () => {
    setLoading(true);
    const { data } = await sessionApi.listAll();
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this debate session?")) return;
    await sessionApi.cancel(id);
    loadSessions();
  };

  const filtered = sessions.filter((s) => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesQuery = String(s.id).includes(query) || s.stance.includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="label-eyebrow mb-1">Session Management</p>
        <h1 className="font-display text-3xl mb-8">All debate sessions</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-muted" />
            <input
              className="input-field pl-10"
              placeholder="Search by session ID or stance…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className="input-field sm:w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-slate-muted text-sm">Loading sessions…</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-slate-muted text-sm">No sessions match your filters.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-muted border-b border-white/5">
                  <th className="px-6 py-3 font-medium">Session</th>
                  <th className="px-6 py-3 font-medium">Stance</th>
                  <th className="px-6 py-3 font-medium">Format</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td
                      className="px-6 py-3 font-mono text-motion-teal cursor-pointer"
                      onClick={() => navigate(`/debate-room/${s.id}`)}
                    >
                      #{String(s.id).padStart(4, "0")}
                    </td>
                    <td className="px-6 py-3 capitalize">{s.stance.replace("_", " ")}</td>
                    <td className="px-6 py-3 capitalize text-slate-muted">
                      {(s.debate_format || "one_on_one").replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-3">{s.duration_minutes} min</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase ${STATUS_STYLES[s.status]}`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {s.status !== "cancelled" && s.status !== "completed" && (
                        <button
                          onClick={() => handleCancel(s.id)}
                          className="text-xs text-rebuttal-coral hover:underline inline-flex items-center gap-1"
                        >
                          <X size={12} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}