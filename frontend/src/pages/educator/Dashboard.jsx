import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import { getEducatorDashboard } from "../../services/dashboardService";
import TopicPopularityChart from "../../components/charts/TopicPopularityChart";
import PerformanceOverviewChart from "../../components/charts/PerformanceOverviewChart";
function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getEducatorDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Educator Dashboard
      </h1>

      {/* Top Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card title="Total Students" value={dashboardData.total_students} />
        <Card title="Total Coaches" value={dashboardData.total_coaches} />
        <Card title="Total Debates" value={dashboardData.total_debates} />
        <Card title="Success Rate" value="89%" />
        <Card title="Active Courses" value="12" />
        <Card title="Top Topic" value="AI Ethics" />

      </div>

      {/* Curriculum Insights */}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            📚 Curriculum Insights
          </h2>

          <ul className="space-y-3">
            <li>📌 AI topics are the most popular.</li>
            <li>📌 Students perform best in Public Forum debates.</li>
            <li>📌 Evidence-based arguments need improvement.</li>
            <li>📌 Debate participation is increasing.</li>
          </ul>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            🎓 Educator Recommendations
          </h2>

          <ul className="space-y-3">
            <li>✅ Encourage use of statistics.</li>
            <li>✅ Focus on rebuttal practice.</li>
            <li>✅ Improve argument structure.</li>
            <li>✅ Conduct weekly debate sessions.</li>
          </ul>

        </div>

      </div>

      {/* Popular Topics */}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            📚 Topic Popularity
          </h2>

          <TopicPopularityChart />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            📈 Performance Overview
          </h2>

          <PerformanceOverviewChart />
        </div>

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;