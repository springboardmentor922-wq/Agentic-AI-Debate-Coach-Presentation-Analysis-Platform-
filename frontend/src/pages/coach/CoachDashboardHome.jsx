import { useEffect, useState } from "react";
import { Users, Inbox, TrendingUp, Trophy, ShieldCheck } from "lucide-react";

import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import LineChart from "../../components/charts/LineChart";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function CoachDashboardHome() {
  const [learners, setLearners] = useState([]);
  const [queue, setQueue] = useState([]);
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/coach/assigned-learners"),
      api.get("/coach/review-queue", {
        params: {
          status: "pending",
        },
      }),
      api.get("/coach/performance-analytics"),
    ])
      .then(([l, q, p]) => {
        setLearners(l.data);
        setQueue(q.data);
        setPerf(p.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const topPerformer = [...learners].sort(
    (a, b) => (b.average_score || 0) - (a.average_score || 0),
  )[0];

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <ShieldCheck size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Coach Dashboard
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Empower learners. Evaluate performance. Build champions.
          </p>
        </div>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Active Learners"
          value={learners.length}
          tone="cool"
        />

        <StatCard
          icon={Inbox}
          label="Pending Evaluations"
          value={queue.length}
          tone="warm"
        />

        <StatCard
          icon={TrendingUp}
          label="Avg. Score"
          value={perf?.average_score ?? "—"}
          tone="verdict"
        />

        <StatCard
          icon={Trophy}
          label="Top Performer"
          value={topPerformer?.learner_name || "—"}
          tone="alert"
        />
      </div>

      {/* Performance Trend */}

      <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <p className="mb-5 text-lg font-semibold text-ink-900 dark:text-white">
          Roster Performance Trend
        </p>

        {perf?.trend?.length > 0 ? (
          <LineChart
            data={perf.trend.map((t) => ({
              label: t.date.slice(5),
              value: t.average,
            }))}
            color="#3FA9F5"
          />
        ) : (
          <p className="py-10 text-center text-sm text-ink-900/50 dark:text-white/50">
            No scored debates yet from your roster.
          </p>
        )}
      </Card>

      {/* Bottom Cards */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Learner Activity */}

        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-5 text-lg font-semibold text-ink-900 dark:text-white">
            Recent Learner Activity
          </p>

          {learners.length > 0 ? (
            learners.slice(0, 5).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between border-b border-black/10 py-3 text-sm last:border-0 dark:border-brand-500/10"
              >
                <span className="font-medium text-ink-900 dark:text-white">
                  {l.learner_name}
                </span>

                <span className="text-ink-900/60 dark:text-white/60">
                  {l.sessions_completed} sessions • avg {l.average_score ?? "—"}
                </span>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-ink-900/50 dark:text-white/50">
              No learners assigned yet.
            </p>
          )}
        </Card>

        {/* Evaluation Queue */}

        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-5 text-lg font-semibold text-ink-900 dark:text-white">
            Evaluation Queue Preview
          </p>

          {queue.length > 0 ? (
            queue.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between border-b border-black/10 py-3 text-sm last:border-0 dark:border-brand-500/10"
              >
                <span className="font-medium text-ink-900 dark:text-white">
                  {q.learner_name}
                </span>

                <span className="text-ink-900/60 dark:text-white/60">
                  {q.topic}
                </span>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-ink-900/50 dark:text-white/50">
              Queue is empty — nothing pending review.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
