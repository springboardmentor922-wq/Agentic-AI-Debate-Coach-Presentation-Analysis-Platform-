import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getMonitoringData } from "../../services/dashboardService";

function Monitoring() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getMonitoringData();
      setData(result);
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        📊 Learner Monitoring Center
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Learner</th>
              <th className="text-left p-3">Coach</th>
              <th className="text-left p-3">Activities</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((learner, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">
                  {learner.learner_name}
                </td>

                <td className="p-3">
                  {learner.coach_name}
                </td>

                <td className="p-3">
                  {learner.activities_completed}
                </td>

                <td className="p-3">
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

export default Monitoring;