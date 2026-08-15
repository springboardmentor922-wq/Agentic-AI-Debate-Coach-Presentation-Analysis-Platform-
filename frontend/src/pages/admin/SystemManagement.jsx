import DashboardLayout from "../../layouts/DashboardLayout";

function SystemManagement() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        ⚙️ System Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold">System Status</h3>
          <p className="text-green-600 mt-2">🟢 Online</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold">Database</h3>
          <p className="mt-2">PostgreSQL Connected</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold">AI Service</h3>
          <p className="mt-2">Gemini Integration Active</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          🔧 Platform Controls
        </h2>

        <div className="space-y-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Backup Database
          </button>

          <button className="bg-green-600 text-white px-4 py-2 rounded ml-3">
            Refresh Statistics
          </button>

          <button className="bg-yellow-600 text-white px-4 py-2 rounded ml-3">
            Generate Reports
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          📋 Recent System Logs
        </h2>

        <ul className="space-y-2">
          <li>✅ User registration successful</li>
          <li>✅ Debate session completed</li>
          <li>✅ Daily missions updated</li>
          <li>✅ Coach feedback submitted</li>
          <li>✅ AI analysis generated</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}

export default SystemManagement;