import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import {
  getEducatorDashboard,
  getMonitoringData,
  getAISummary
} from "../../services/dashboardService";
import TopicPopularityChart from "../../components/charts/TopicPopularityChart";
import PerformanceOverviewChart from "../../components/charts/PerformanceOverviewChart";
function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [monitoringData, setMonitoringData] = useState([]);
  const [aiSummary, setAiSummary] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getEducatorDashboard();
        setDashboardData(data);

        const monitoring = await getMonitoringData();
        setMonitoringData(monitoring);

        const summaryData = await getAISummary();
        setAiSummary(summaryData.summary);
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
      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          🤖 AI Class Summary
        </h2>

        <div className="space-y-3">

          {aiSummary.map((item, index) => (

            <div
              key={index}
              className="border-l-4 border-indigo-500 pl-4 py-2 bg-gray-50 rounded"
            >

              {item}

            </div>

          ))}

        </div>

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
      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          📊 Learner Monitoring
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border">

            <thead>

              <tr className="bg-gray-100">

                <th className="p-3 border">Learner</th>
                <th className="p-3 border">Coach</th>
                <th className="p-3 border">Activities</th>
                <th className="p-3 border">Status</th>

              </tr>

            </thead>

            <tbody>

              {monitoringData.map((learner, index) => (

                <tr key={index}>

                  <td className="p-3 border">
                    {learner.learner_name}
                  </td>

                  <td className="p-3 border">
                    {learner.coach_name}
                  </td>

                  <td className="p-3 border">
                    {learner.activities_completed}
                  </td>

                  <td className="p-3 border">
                    {learner.status}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

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