import DashboardLayout from "../../layouts/DashboardLayout";
import StudentPerformanceChart from "../../components/charts/StudentPerformanceChart";
import SkillGapChart from "../../components/charts/SkillGapChart";

function ClassPerformance() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        📈 Class Performance
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Average Score
          </h2>

          <p className="text-3xl font-bold">
            84%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Total Debates
          </h2>

          <p className="text-3xl font-bold">
            156
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Improvement Rate
          </h2>

          <p className="text-3xl font-bold text-green-600">
            +12%
          </p>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Student Performance Trend
          </h2>

          <div className="h-[300px]">
            <StudentPerformanceChart />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Skill Gap Distribution
          </h2>

          <div className="h-[300px]">
            <SkillGapChart />
          </div>
        </div>

      </div>

    </DashboardLayout>
  );
}

export default ClassPerformance;