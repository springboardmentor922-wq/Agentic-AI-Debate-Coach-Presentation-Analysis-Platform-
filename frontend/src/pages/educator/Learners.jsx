import DashboardLayout from "../../layouts/DashboardLayout";

function Learners() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        👨‍🎓 Learners
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Learners</h2>
          <p className="text-3xl font-bold">24</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Active Learners</h2>
          <p className="text-3xl font-bold">18</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Need Attention</h2>
          <p className="text-3xl font-bold text-red-500">5</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Learner List
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Coach</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="py-2">Neha</td>
              <td>Coach</td>
              <td className="text-green-600">Active</td>
            </tr>

            <tr className="border-b">
              <td className="py-2">Rahul</td>
              <td>Coach</td>
              <td className="text-red-600">Attention</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Learners;