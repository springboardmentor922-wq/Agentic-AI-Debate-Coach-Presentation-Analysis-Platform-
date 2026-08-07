import { useEffect, useState } from "react";
import {
  Users,
  Swords,
  TrendingUp,
  AlertTriangle,
  FileBarChart2,
} from "lucide-react";

import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import LineChart from "../../components/charts/LineChart";
import DonutChart from "../../components/charts/DonutChart";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const ROLE_COLORS = {
  learner: "#8B5CF6",
  debate_coach: "#3B82F6",
  educator: "#10B981",
  administrator: "#F43F5E",
};

const ROLE_LABELS = {
  learner: "Learners",
  debate_coach: "Debate Coaches",
  educator: "Educators",
  administrator: "Admins",
};

export default function AdminDashboardHome() {
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const roleData = Object.entries(data.users_by_role).map(([role, value]) => ({
    label: ROLE_LABELS[role] || role,
    value,
    color: ROLE_COLORS[role],
  }));

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
          Real-time overview of platform operations and performance.
        </p>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={data.total_users}
          tone="cool"
        />

        <StatCard
          icon={Swords}
          label="Debate Sessions"
          value={data.total_debate_sessions}
          tone="warm"
        />

        <StatCard
          icon={AlertTriangle}
          label="Fallacies Detected"
          value={data.total_fallacies_detected}
          tone="alert"
        />

        <StatCard
          icon={FileBarChart2}
          label="Reports Generated"
          value={data.total_reports_generated}
          tone="verdict"
        />
      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-gray-200 bg-white lg:col-span-2 dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-button-gradient shadow-premium">
              <TrendingUp size={18} className="text-white" />
            </div>

            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Debate Sessions — Last 7 Days
            </p>
          </div>

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
            User Role Distribution
          </p>

          <DonutChart
            data={roleData}
            centerLabel="Total Users"
            centerValue={data.total_users}
          />
        </Card>
      </div>

      {/* Signups */}

      <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
            <Users size={18} className="text-white" />
          </div>

          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            New Signups — Last 7 Days
          </p>
        </div>

        <LineChart
          data={data.user_signups_last_7_days.map((d) => ({
            label: d.date.slice(5),
            value: d.count,
          }))}
          color="#3B82F6"
        />
      </Card>
    </div>
  );
}
