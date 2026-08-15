import DashboardLayout from "../../layouts/DashboardLayout";

function Learners() {
  const learners = [
    {
      id: 1,
      name: "Neha",
      coach: "Kalyani",
      debates: 24,
      score: 82,
      status: "Active",
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        👨‍🎓 Learners Management
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Learner Name</th>
              <th className="text-left p-3">Assigned Coach</th>
              <th className="text-left p-3">Total Debates</th>
              <th className="text-left p-3">Average Score</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {learners.map((learner) => (
              <tr key={learner.id} className="border-b">
                <td className="p-3">{learner.name}</td>
                <td className="p-3">{learner.coach}</td>
                <td className="p-3">{learner.debates}</td>
                <td className="p-3">{learner.score}%</td>
                <td className="p-3 text-green-600">
                  {learner.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Learners;