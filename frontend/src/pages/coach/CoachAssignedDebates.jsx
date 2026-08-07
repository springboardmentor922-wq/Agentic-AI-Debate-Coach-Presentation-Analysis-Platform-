import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
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

export default function CoachAssignedDebates() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/coach/assigned-debates")
      .then(({ data }) => setDebates(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <ClipboardList size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Assigned Debates
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Every debate session from learners on your roster.
          </p>
        </div>
      </div>

      {/* Table */}

      <Card
        padding="sm"
        className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={6} cols={4} />
        ) : debates.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No debates yet"
            description="Debates from your assigned learners will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-ink-900/50 dark:border-white/10 dark:text-white/40">
                  <th className="py-3 pl-3">Topic</th>
                  <th className="py-3">Format</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 pr-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {debates.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-black/10 last:border-0 transition-all duration-300 hover:bg-gray-100 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="py-3 pl-3 font-semibold text-ink-900 dark:text-white">
                      {d.topic || "Untitled"}
                    </td>

                    <td className="py-3 text-ink-900/70 dark:text-white/70">
                      {(d.debate_format || "").replaceAll("_", " ")}
                    </td>

                    <td className="py-3">
                      <Badge tone={STATUS_TONE[d.status] || "neutral"}>
                        {d.status}
                      </Badge>
                    </td>

                    <td className="py-3 pr-3 text-ink-900/60 dark:text-white/60">
                      {d.created_at
                        ? new Date(d.created_at).toLocaleDateString()
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
