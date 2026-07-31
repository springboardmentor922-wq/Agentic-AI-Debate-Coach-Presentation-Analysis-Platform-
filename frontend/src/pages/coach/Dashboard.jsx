import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import { getCoachDashboard } from "../../services/dashboardService";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getCoachDashboard();
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
        Coach Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Learners"
          value={dashboardData.total_students}
        />

        <Card
          title="Total Debates"
          value={dashboardData.total_debates}
        />

        <Card
          title="Coach Status"
          value={dashboardData.coach_status}
        />
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold mb-4">
      Recent Student Activity
    </h2>

    <ul className="space-y-3">
      <li>👩‍🎓 Neha - AI Debate - Score 82</li>
      <li>👨‍🎓 Rahul - Oxford Debate - Score 76</li>
      <li>👩‍🎓 Priya - Policy Debate - Score 88</li>
    </ul>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold mb-4">
      AI Coaching Insights
    </h2>

    <ul className="space-y-3">
      <li>📌 Learners need stronger evidence.</li>
      <li>📌 Counterarguments are improving.</li>
      <li>📌 Confidence scores increased.</li>
    </ul>
  </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;