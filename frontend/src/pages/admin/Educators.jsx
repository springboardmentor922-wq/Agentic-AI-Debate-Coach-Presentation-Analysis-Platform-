import DashboardLayout from "../../layouts/DashboardLayout";

function Educators() {
  const educators = [
    {
      id: 1,
      name: "Dr. Srinivas",
      department: "CSE-AIML",
      learners: 25,
      status: "Active",
    },
    {
      id: 2,
      name: "Mrs. Lakshmi",
      department: "CSE",
      learners: 20,
      status: "Active",
    },
    {
      id: 3,
      name: "Mr. Ramesh",
      department: "IT",
      learners: 18,
      status: "Active",
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        👩‍🏫 Educators Management
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Department</th>
              <th className="text-left p-3">Learners</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {educators.map((educator) => (
              <tr key={educator.id} className="border-b">
                <td className="p-3">{educator.name}</td>
                <td className="p-3">{educator.department}</td>
                <td className="p-3">{educator.learners}</td>
                <td className="p-3 text-green-600">
                  {educator.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Educators;