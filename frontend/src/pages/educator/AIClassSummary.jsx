import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAISummary } from "../../services/dashboardService";

function AIClassSummary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const data = await getAISummary();
      setSummary(data);
    };

    fetchSummary();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        🤖 AI Class Summary
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        {summary ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Class Insights
            </h2>

            <p className="text-gray-700">
              {summary.summary}
            </p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AIClassSummary;