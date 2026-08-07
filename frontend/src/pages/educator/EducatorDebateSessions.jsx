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
};

export default function EducatorDebateSessions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/educator/debate-sessions")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <Swords size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Debate Sessions
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Every debate session across all learners.
          </p>
        </div>
      </div>

      {/* Sessions Table */}

      <Card
        padding="sm"
        className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={6} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Swords}
            title="No sessions yet"
            description="Debate sessions will appear here as learners practice."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-ink-900/50 dark:border-brand-500/20 dark:text-brand-300">
                  <th className="py-3 pl-3">Topic</th>

                  <th className="py-3">Format</th>

                  <th className="py-3">Status</th>

                  <th className="py-3 pr-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {items.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-black/10 last:border-0 transition-all duration-300 hover:bg-gray-50 dark:border-brand-500/10 dark:hover:bg-brand-500/5"
                  >
                    <td className="py-3 pl-3 font-medium text-ink-900 dark:text-white">
                      {s.topic || "Untitled"}
                    </td>

                    <td className="py-3 text-ink-900/70 dark:text-white/70">
                      {(s.debate_format || "").replace("_", " ")}
                    </td>

                    <td className="py-3">
                      <Badge tone={STATUS_TONE[s.status] || "neutral"}>
                        {s.status}
                      </Badge>
                    </td>

                    <td className="py-3 pr-3 text-ink-900/50 dark:text-white/50">
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
