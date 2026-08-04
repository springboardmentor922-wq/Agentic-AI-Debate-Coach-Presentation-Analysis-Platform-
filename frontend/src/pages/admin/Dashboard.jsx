import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/common/Spinner";
import Card from "../../components/common/Card";

import { getDashboardStats } from "../../services/dashboardService";

import UserDistributionChart from "../../components/charts/UserDistributionChart";
import PlatformGrowthChart from "../../components/charts/PlatformGrowthChart";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">
          Admin Dashboard
        </h1>

        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      {/* Top Statistics Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card
          title="Learners"
          value={stats.total_learners}
        />

        <Card
          title="Coaches"
          value={stats.total_coaches}
        />

        <Card
          title="Educators"
          value={stats.total_educators}
        />

        <Card
          title="Admins"
          value={stats.total_admins}
        />

      </div>

      {/* Charts */}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            👥 User Distribution
          </h2>

          <UserDistributionChart />

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            📈 Platform Growth
          </h2>

          <PlatformGrowthChart />

        </div>

      </div>

      {/* Platform Overview + AI Analytics */}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            ⚡ Platform Overview
          </h2>

          <div className="space-y-3">

            <p>
              👥 Total Users: {
                stats.total_learners +
                stats.total_coaches +
                stats.total_educators +
                stats.total_admins
              }
            </p>

            <p>🟢 System Status: Healthy</p>

            <p>🤖 AI Service: Online</p>

            <p>🔒 Authentication: Active</p>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            🤖 AI Analytics
          </h2>

          <div className="space-y-3">

            <p>📊 Counterarguments Generated: 150+</p>

            <p>⚠️ Fallacies Detected: 75+</p>

            <p>🎯 Coaching Sessions: 120+</p>

            <p>📈 User Engagement: High</p>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;