import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

import Card from "../../components/ui/Card";
import LineChart from "../../components/charts/LineChart";
import BarChart from "../../components/charts/BarChart";
import DonutChart from "../../components/charts/DonutChart";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const ROLE_COLORS = {
  learner: "#8B5CF6",
  debate_coach: "#3B82F6",
  educator: "#10B981",
  administrator: "#F43F5E",
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!data) return null;

  const roleData = Object.entries(data.users_by_role).map(([role, value]) => ({
    label: role.replace("_", " "),
    value,
    color: ROLE_COLORS[role],
  }));

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <BarChart3 size={28} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            System Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
            Real aggregations from live platform data — nothing simulated.
          </p>
        </div>
      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
            Debate Sessions — Last 7 Days
          </p>

          <LineChart
            data={data.sessions_last_7_days.map((d) => ({
              label: d.date.slice(5),
              value: d.count,
            }))}
            color="#8B5CF6"
          />
        </Card>

        <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
            New Signups — Last 7 Days
          </p>

          <BarChart
            data={data.user_signups_last_7_days.map((d) => ({
              label: d.date.slice(5),
              value: d.count,
            }))}
            color="#3B82F6"
          />
        </Card>

        <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
            User Role Distribution
          </p>

          <DonutChart
            data={roleData}
            centerLabel="Total Users"
            centerValue={data.total_users}
          />
        </Card>

        <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
            Platform Totals
          </p>

          <div className="grid grid-cols-2 gap-5">
            {[
              ["Total Users", data.total_users],
              ["Debate Sessions", data.total_debate_sessions],
              ["Fallacies Detected", data.total_fallacies_detected],
              ["Reports Generated", data.total_reports_generated],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-glow-mix dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-ink-800 dark:to-ink-900"
              >
                <p className="font-data text-4xl font-bold text-gray-900 dark:text-white">
                  {value}
                </p>

                <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
