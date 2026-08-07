import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function EducatorLearners() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState({});

  useEffect(() => {
    api
      .get("/educator/learners")
      .then(({ data }) => {
        setLearners(data);

        data.forEach((l) => {
          api
            .get("/coaching-plans", {
              params: {
                learner_id: l.id,
              },
            })
            .then(({ data: list }) => {
              if (list?.[0]) {
                setPlans((prev) => ({
                  ...prev,
                  [l.id]: list[0],
                }));
              }
            })
            .catch(() => {});
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <Users size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Learners
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            {learners.length} learner(s) on the platform
          </p>
        </div>
      </div>

      {/* Table */}

      <Card
        padding="sm"
        className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : learners.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No learners yet"
            description="Learners will appear here as they join the platform."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-ink-900/50 dark:border-brand-500/20 dark:text-brand-300">
                  <th className="py-3 pl-3">Name</th>

                  <th className="py-3">Institution</th>

                  <th className="py-3">Sessions</th>

                  <th className="py-3">Avg Score</th>

                  <th className="py-3">Coaching Plan</th>

                  <th className="py-3 pr-3">Last Activity</th>
                </tr>
              </thead>

              <tbody>
                {learners.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-black/10 transition-all duration-300 hover:bg-gray-50 last:border-0 dark:border-brand-500/10 dark:hover:bg-brand-500/5"
                  >
                    <td className="py-3 pl-3 font-semibold text-ink-900 dark:text-white">
                      {l.full_name}
                    </td>

                    <td className="py-3 text-ink-900/70 dark:text-white/70">
                      {l.institution || "—"}
                      {l.department ? ` · ${l.department}` : ""}
                    </td>

                    <td className="py-3 text-ink-900/70 dark:text-white/70">
                      {l.sessions_completed}
                    </td>

                    <td className="py-3 font-data font-semibold text-brand-600 dark:text-brand-300">
                      {l.average_score ?? "—"}
                    </td>

                    <td className="min-w-[150px] py-3">
                      {plans[l.id] ? (
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <ProgressBar
                              value={plans[l.id].completion_percent}
                              size="sm"
                              showValue={false}
                            />
                          </div>

                          <Badge
                            tone={
                              plans[l.id].status === "completed"
                                ? "success"
                                : "brand"
                            }
                          >
                            {Math.round(plans[l.id].completion_percent)}%
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-ink-900/30 dark:text-white/30">
                          —
                        </span>
                      )}
                    </td>

                    <td className="py-3 pr-3 text-ink-900/50 dark:text-white/50">
                      {l.last_activity_at
                        ? new Date(l.last_activity_at).toLocaleDateString()
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
