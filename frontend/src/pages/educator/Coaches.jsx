import DashboardLayout from "../../layouts/DashboardLayout";

function Coaches() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        👨‍🏫 Coaches
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

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
            Active Coaches
          </h2>

          <p className="text-3xl font-bold">
            7
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Learners Assigned
          </h2>

          <p className="text-3xl font-bold">
            24
          </p>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          Coach Directory
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3">
                Coach
              </th>

              <th className="text-left py-3">
                Specialization
              </th>

              <th className="text-left py-3">
                Learners
              </th>

            </tr>

          </thead>

          <tbody>

            <tr className="border-b">
              <td className="py-3">Coach</td>
              <td>Debate Strategy</td>
              <td>12</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">John</td>
              <td>Public Speaking</td>
              <td>8</td>
            </tr>

            <tr>
              <td className="py-3">Priya</td>
              <td>Critical Thinking</td>
              <td>4</td>
            </tr>

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}

export default Coaches;