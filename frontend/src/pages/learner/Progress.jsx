import DashboardLayout from "../../layouts/DashboardLayout";
import PerformanceChart from "../../components/charts/PerformanceChart";

function Progress() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        📊 My Progress
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Average Score</h2>
          <p className="text-3xl font-bold">82%</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Total Debates</h2>
          <p className="text-3xl font-bold">25</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Current Rank</h2>
          <p className="text-3xl font-bold">#5</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Debate Streak</h2>
          <p className="text-3xl font-bold">🔥 7</p>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Performance Trend
        </h2>

        <PerformanceChart />
      </div>
    </DashboardLayout>
  );
}

export default Progress;