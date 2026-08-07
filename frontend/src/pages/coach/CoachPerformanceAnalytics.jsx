import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

import Card from "../../components/ui/Card";
import LineChart from "../../components/charts/LineChart";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function CoachPerformanceAnalytics() {
  const [data, setData] = useState(null);
  const [learnerNames, setLearnerNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/coach/performance-analytics"),
      api.get("/coach/assigned-learners"),
    ])
      .then(([p, l]) => {
        setData(p.data);

        const map = {};
        l.data.forEach((x) => {
          map[x.learner_id] = x.learner_name;
        });

        setLearnerNames(map);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <SkeletonCard />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <BarChart3 size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Performance Analytics
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Real score trends across your learner roster.
          </p>
        </div>
      </div>

      {/* Trend Chart */}

      <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <p className="mb-5 text-xl font-semibold text-ink-900 dark:text-white">
          Average Score Trend
        </p>

        {data.trend.length > 0 ? (
          <LineChart
            data={data.trend.map((t) => ({
              label: t.date.slice(5),
              value: t.average,
            }))}
            color="#3FA9F5"
          />
        ) : (
          <p className="py-10 text-center text-sm text-ink-900/50 dark:text-white/50">
            No scored debates yet.
          </p>
        )}
      </Card>

      {/* Learner Performance */}

      <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <p className="mb-5 text-xl font-semibold text-ink-900 dark:text-white">
          Per-Learner Averages
        </p>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-white/50">
                  Learner
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-white/50">
                  Sessions
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right text-ink-900/50 dark:text-white/50">
                  Average Score
                </th>
              </tr>
            </thead>

            <tbody>
              {data.per_learner.map((row) => (
                <tr
                  key={row.learner_id}
                  className="border-b border-black/5 transition-all duration-300 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-4 font-medium text-ink-900 dark:text-white">
                    {learnerNames[row.learner_id] || row.learner_id}
                  </td>

                  <td className="px-4 py-4 text-ink-900/60 dark:text-white/60">
                    {row.session_count}
                  </td>

                  <td className="px-4 py-4 text-right font-data text-lg font-bold text-brand-500">
                    {row.average_score}
                  </td>
                </tr>
              ))}

              {data.per_learner.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-10 text-center text-sm text-ink-900/50 dark:text-white/50"
                  >
                    No learner performance data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
