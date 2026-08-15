import DashboardLayout from "../../layouts/DashboardLayout";

function Reports() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        📋 Reports
      </h1>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Total Learners
          </h2>

          <p className="text-3xl font-bold">
            24
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Total Coaches
          </h2>

          <p className="text-3xl font-bold">
            8
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
            Average Score
          </h2>

          <p className="text-3xl font-bold">
            84%
          </p>
        </div>

      </div>

      {/* Monthly Report */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          Monthly Performance Report
        </h2>

        <div className="space-y-3">

          <p>
            ✅ 156 debates completed this month
          </p>

          <p>
            ✅ Average learner score increased by 12%
          </p>

          <p>
            ✅ 72% learners actively participated
          </p>

          <p>
            ✅ AI feedback usage increased by 18%
          </p>

        </div>

        <button
          className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          📥 Download Report
        </button>

      </div>

    </DashboardLayout>
  );
}

export default Reports;