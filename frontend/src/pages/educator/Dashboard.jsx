import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import { getEducatorDashboard } from "../../services/dashboardService";

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Students"
          value={dashboardData.total_students}
        />

        <Card
          title="Total Coaches"
          value={dashboardData.total_coaches}
        />

        <Card
          title="Total Debates"
          value={dashboardData.total_debates}
        />
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold mb-4">
      Popular Debate Topics
    </h2>

    <ul className="space-y-3">
      <li>🤖 Should AI Replace Teachers?</li>
      <li>📱 Social Media and Education</li>
      <li>🌐 Online Learning vs Classroom Learning</li>
    </ul>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold mb-4">
      Performance Overview
    </h2>

    <ul className="space-y-3">
      <li>Logic Score: 78%</li>
      <li>Clarity Score: 82%</li>
      <li>Evidence Score: 71%</li>
      <li>Persuasiveness: 80%</li>
    </ul>
  </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;