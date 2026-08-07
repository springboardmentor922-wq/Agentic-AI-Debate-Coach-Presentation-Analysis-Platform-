import { useEffect, useState } from "react";
import { Users, School, Swords, TrendingUp } from "lucide-react";

import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function EducatorDashboardHome() {
  const [learners, setLearners] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/educator/learners"),
      api.get("/educator/classroom-analytics"),
    ])
      .then(([l, c]) => {
        setLearners(l.data);
        setClassrooms(c.data);
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

  const totalSessions = classrooms.reduce(
    (s, c) => s + c.total_sessions_completed,
    0,
  );

  const avgScore = classrooms.length
    ? Math.round(
        (classrooms.reduce((s, c) => s + (c.average_score || 0), 0) /
          classrooms.length) *
          10,
      ) / 10
    : null;

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <School size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Educator Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor your learners, review performance, and guide them to excel.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Learners"
          value={learners.length}
          tone="cool"
        />

        <StatCard
          icon={School}
          label="Classes"
          value={classrooms.length}
          tone="warm"
        />

        <StatCard
          icon={Swords}
          label="Debates Conducted"
          value={totalSessions}
          tone="verdict"
        />

        <StatCard
          icon={TrendingUp}
          label="Avg. Class Score"
          value={avgScore ?? "—"}
          tone="alert"
        />
      </div>

      {/* Overview */}
      <Card className="border border-gray-200 bg-white shadow-card dark:border-brand-500/20 dark:bg-brand-950">
        <p className="mb-5 text-xl font-semibold text-gray-900 dark:text-white">
          Classes Overview
        </p>

        <div className="flex flex-col gap-4">
          {classrooms.map((c) => (
            <div
              key={c.classroom}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 transition-all duration-300 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-brand-900/30"
            >
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {c.classroom}
                </p>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {c.learner_count} learners • {c.total_sessions_completed}{" "}
                  sessions
                </p>
              </div>

              <div className="text-right">
                <p className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text font-data text-3xl font-bold text-transparent">
                  {c.average_score ?? "—"}
                </p>

                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500">
                  Avg Score
                </p>
              </div>
            </div>
          ))}

          {classrooms.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No classes yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
