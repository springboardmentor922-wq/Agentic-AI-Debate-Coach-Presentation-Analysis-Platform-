import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import { getLearnerDashboard } from "../../services/dashboardService";
import SkillRadarChart from "../../components/charts/SkillRadarChart";
import PerformanceChart from "../../components/charts/PerformanceChart";

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

      {/* Welcome Banner */}

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h2 className="text-2xl font-bold">
          Agentic AI Debate Coach 🚀
        </h2>
        <p className="mt-2">
          Improve your debating skills with AI-powered coaching,
          scoring, fallacy detection and personalized feedback.
        </p>
      </div>
      <div className="bg-white rounded-xl p-5 shadow mb-6">

        <div className="flex justify-between mb-2">

          <span className="font-semibold">
            Intermediate Level
          </span>

          <span>
            1250 / 2000 XP
          </span>

        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className="bg-indigo-600 h-3 rounded-full"
            style={{ width: "62%" }}
          />

        </div>

      </div>

      {/* Top Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">

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
        <Card
          title="Current Rank"
          value="#5"
        />

        <Card
          title="Debate Streak"
          value="🔥 7 Days"
        />

      </div>

      {/* Progress + Recommendations */}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Skill Analysis */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            📈 Skill Analysis
          </h2>

          <SkillRadarChart />

        </div>

        {/* AI Recommendations */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            🎯 AI Recommendations
          </h2>

          <ul className="space-y-3">
            <li>📌 Add more evidence to arguments.</li>
            <li>📌 Improve rebuttal structure.</li>
            <li>📌 Avoid absolute claims.</li>
            <li>📌 Use statistics when possible.</li>
          </ul>

        </div>

      </div>

      {/* Recent Scores */}

      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          📈 Performance Trend
        </h2>

        <PerformanceChart />

      </div>

      {/* Next Challenge */}

      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          🔥 Next Challenge
        </h2>

        <p className="text-gray-700">
          Should Social Media Be Regulated by Governments?
        </p>

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;