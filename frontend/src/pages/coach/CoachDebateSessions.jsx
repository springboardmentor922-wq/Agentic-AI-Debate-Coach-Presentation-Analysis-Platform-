import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const STATUS_TONE = {
  pending: "warning",
  in_review: "brand",
  reviewed: "success",
  educator_approved: "success",
};

export default function CoachDebateSessions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/coach/review-queue")
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
            Every session in the coaching pipeline — pending, in review, or
            reviewed.
          </p>
        </div>
      </div>

      {/* Table */}

      <Card
        padding="sm"
        className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Swords}
            title="Nothing in the pipeline yet"
            description="Sessions appear here the moment a learner finishes a debate."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-ink-900/50 dark:border-brand-500/20 dark:text-brand-300">
                  <th className="py-3 pl-3">Learner</th>
                  <th className="py-3">Topic</th>
                  <th className="py-3">AI Score</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 pr-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {items.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => navigate(`/coach/review/${session.id}`)}
                    className="cursor-pointer border-b border-black/10 transition-all duration-300 hover:bg-gray-50 last:border-0 dark:border-brand-500/10 dark:hover:bg-brand-500/5"
                  >
                    <td className="py-3 pl-3 font-semibold text-ink-900 dark:text-white">
                      {session.learner_name}
                    </td>

                    <td className="py-3 text-ink-900/70 dark:text-white/70">
                      {session.topic}
                    </td>

                    <td className="py-3 font-data font-semibold text-brand-500 dark:text-brand-300">
                      {session.ai_overall_score ?? "—"}
                    </td>

                    <td className="py-3">
                      <Badge tone={STATUS_TONE[session.status] || "neutral"}>
                        {session.status.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="py-3 pr-3 text-ink-900/50 dark:text-white/50">
                      {session.created_at
                        ? new Date(session.created_at).toLocaleDateString()
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
