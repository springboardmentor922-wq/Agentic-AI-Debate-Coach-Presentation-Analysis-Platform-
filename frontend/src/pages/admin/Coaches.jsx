import DashboardLayout from "../../layouts/DashboardLayout";

function Coaches() {
  const coaches = [
    {
      id: 1,
      name: "Satya",
      learners: 12,
      debatesReviewed: 85,
      status: "Active",
    },
    {
      id: 2,
      name: "Paru",
      learners: 10,
      debatesReviewed: 72,
      status: "Active",
    },
    {
      id: 3,
      name: "Kalyani",
      learners: 8,
      debatesReviewed: 64,
      status: "Active",
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        👨‍🏫 Coaches Management
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Coach Name</th>
              <th className="text-left p-3">Assigned Learners</th>
              <th className="text-left p-3">Debates Reviewed</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {coaches.map((coach) => (
              <tr key={coach.id} className="border-b">
                <td className="p-3">{coach.name}</td>
                <td className="p-3">{coach.learners}</td>
                <td className="p-3">{coach.debatesReviewed}</td>
                <td className="p-3 text-green-600">
                  {coach.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Coaches;