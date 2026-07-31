import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import { getLearnerDashboard } from "../../services/dashboardService";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getLearnerDashboard();
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
        Welcome to Learner Dashboard 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Debates"
          value={dashboardData.total_debates}
        />

        <Card
          title="Average Score"
          value={`${dashboardData.average_score}%`}
        />

        <Card
          title="Fallacies Found"
          value={dashboardData.fallacies_found}
        />

        <Card
          title="AI Feedback"
          value={dashboardData.ai_feedback}
        />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;