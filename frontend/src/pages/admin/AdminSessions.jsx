import { useEffect, useState } from "react";
import { Swords } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const STATUS_TONE = {
  completed: "success",
  in_progress: "brand",
  pending: "warning",
  abandoned: "danger",
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);

    api
      .get("/admin/debate-sessions", {
        params: {
          status_filter: statusFilter || undefined,
        },
      })
      .then(({ data }) => setSessions(data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
            <Swords size={24} className="text-white" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Debate Sessions
            </h1>

            <p className="text-sm text-gray-600 dark:text-white/60">
              {sessions.length} session(s) shown
            </p>
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto border border-gray-300 bg-white text-gray-900 dark:border-brand-500/30 dark:bg-ink-900 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <Card
        padding="sm"
        className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={6} cols={4} />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Swords}
            title="No debate sessions found"
            description="Sessions will appear here as learners debate on the platform."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 dark:border-brand-500/20 dark:text-brand-300">
                  <th className="py-3 pl-2">Topic</th>

                  <th className="py-3">Format</th>

                  <th className="py-3">Status</th>

                  <th className="py-3 pr-2">Created</th>
                </tr>
              </thead>

              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-200 transition-all hover:bg-gray-50 last:border-0 dark:border-brand-500/10 dark:hover:bg-brand-500/5"
                  >
                    <td className="py-3 pl-2 font-medium text-gray-900 dark:text-white">
                      {s.topic || "Untitled"}
                    </td>

                    <td className="py-3 capitalize text-gray-600 dark:text-white/70">
                      {(s.debate_format || "").replace("_", " ")}
                    </td>

                    <td className="py-3">
                      <Badge tone={STATUS_TONE[s.status] || "neutral"}>
                        {s.status || "unknown"}
                      </Badge>
                    </td>

                    <td className="py-3 pr-2 text-gray-500 dark:text-white/50">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
