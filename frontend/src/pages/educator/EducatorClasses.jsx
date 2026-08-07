import { useEffect, useState } from "react";
import { School } from "lucide-react";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function EducatorClasses() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/educator/classroom-analytics")
      .then(({ data }) => setClassrooms(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <School size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            My Classes
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Grouped by institution / department, computed live from real learner
            records.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classes yet"
          description="Classes are derived from learners' institution/department fields on their profile."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {classrooms.map((c) => (
            <Card
              key={c.classroom}
              className="border border-black/10 bg-white shadow-card transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
            >
              <p className="text-xl font-semibold text-ink-900 dark:text-white">
                {c.classroom}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-gray-100 p-3 dark:bg-white/5">
                  <p className="font-data text-3xl font-bold text-ink-900 dark:text-white">
                    {c.learner_count}
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-900/40 dark:text-white/40">
                    Learners
                  </p>
                </div>

                <div className="rounded-xl bg-gray-100 p-3 dark:bg-white/5">
                  <p className="font-data text-3xl font-bold text-ink-900 dark:text-white">
                    {c.total_sessions_completed}
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-900/40 dark:text-white/40">
                    Sessions
                  </p>
                </div>

                <div className="rounded-xl border border-brand-500/20 bg-brand-50 p-3 dark:bg-gradient-to-r dark:from-brand-600/20 dark:to-accent-500/20">
                  <p className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text font-data text-3xl font-bold text-transparent">
                    {c.average_score ?? "—"}
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-900/40 dark:text-white/40">
                    Avg Score
                  </p>
                </div>
              </div>

              {c.top_performers?.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
                    Top Performers
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {c.top_performers.map((p) => (
                      <Badge key={p.id} tone="success">
                        {p.full_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {c.needs_attention?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-accent-300">
                    Needs Attention
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {c.needs_attention.map((p) => (
                      <Badge key={p.id} tone="danger">
                        {p.full_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
