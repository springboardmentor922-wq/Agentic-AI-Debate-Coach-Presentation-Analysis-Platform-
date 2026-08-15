import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/common/Spinner";
import { getMyCoach } from "../../services/dashboardService";

function MyCoach() {
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const data = await getMyCoach();
        setCoach(data);
      } catch (error) {
        console.error("Failed to load coach:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        👨‍🏫 My Coach
      </h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <h2 className="text-xl font-bold mb-3">
          Assigned Debate Coach
        </h2>

        {coach?.coach_name ? (
          <>
            <p className="text-2xl font-semibold text-indigo-600">
              {coach.coach_name}
            </p>

            <p className="text-gray-500 mt-2">
              Your assigned coach can help you improve your
              arguments, evidence, rebuttals and overall debate
              performance.
            </p>
          </>
        ) : (
          <p className="text-gray-500">
            No coach has been assigned yet.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyCoach;