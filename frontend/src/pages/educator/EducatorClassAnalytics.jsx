import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

import Card from "../../components/ui/Card";
import BarChart from "../../components/charts/BarChart";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function EducatorClassAnalytics() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/educator/classroom-analytics")
      .then(({ data }) => setClassrooms(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonCard />;

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <BarChart3 size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Class Analytics
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Real average scores per class, computed live.
          </p>
        </div>
      </div>

      {/* Chart */}

      <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <p className="mb-5 text-lg font-semibold text-ink-900 dark:text-white">
          Average Score by Class
        </p>

        {classrooms.length > 0 ? (
          <BarChart
            data={classrooms.map((c) => ({
              label: c.classroom,
              value: c.average_score || 0,
            }))}
            color="#8B5CF6"
          />
        ) : (
          <p className="py-10 text-center text-sm text-ink-900/50 dark:text-white/50">
            No class data yet.
          </p>
        )}
      </Card>

      {/* Class Cards */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {classrooms.map((c) => (
          <Card
            key={c.classroom}
            className="border border-black/10 bg-white shadow-card transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
          >
            <p className="text-lg font-semibold text-ink-900 dark:text-white">
              {c.classroom}
            </p>

            <p className="mt-2 text-sm text-ink-900/60 dark:text-white/60">
              {c.learner_count} learners · {c.total_sessions_completed} sessions
              ·{" "}
              {c.average_improvement_pct != null
                ? `${
                    c.average_improvement_pct > 0 ? "+" : ""
                  }${c.average_improvement_pct}% improvement`
                : "no trend data yet"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
