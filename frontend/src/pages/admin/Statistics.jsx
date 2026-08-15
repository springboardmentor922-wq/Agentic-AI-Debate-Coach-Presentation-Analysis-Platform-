import DashboardLayout from "../../layouts/DashboardLayout";

function Statistics() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        📊 Platform Statistics
      </h1>

      {/* Top Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Total Learners</h3>
          <p className="text-3xl font-bold mt-2">25</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Total Coaches</h3>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Total Educators</h3>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Debates Conducted</h3>
          <p className="text-3xl font-bold mt-2">142</p>
        </div>

      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          📈 Performance Overview
        </h2>

        <ul className="space-y-3">
          <li>✅ Average Debate Score: 82%</li>
          <li>✅ Evidence Usage Improved by 18%</li>
          <li>✅ Rebuttal Quality Improved by 14%</li>
          <li>✅ Confidence Scores Increased by 15%</li>
        </ul>
      </div>

      {/* Debate Formats */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          🎤 Most Popular Debate Formats
        </h2>

        <ul className="space-y-2">
          <li>🥇 Public Forum Debate</li>
          <li>🥈 Oxford Style Debate</li>
          <li>🥉 Policy Debate</li>
        </ul>
      </div>

      {/* AI Analytics */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          🤖 AI Analytics
        </h2>

        <ul className="space-y-2">
          <li>72% learners need stronger evidence usage</li>
          <li>5 learners require coach intervention</li>
          <li>Fallacy detection accuracy improving</li>
          <li>Argument structure scores trending upward</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}

export default Statistics;