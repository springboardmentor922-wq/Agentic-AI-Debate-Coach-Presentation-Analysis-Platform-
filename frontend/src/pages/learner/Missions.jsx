import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/common/Spinner";
import { getDailyMissions } from "../../services/dashboardService";

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const data = await getDailyMissions();
        setMissions(data);
      } catch (error) {
        console.error("Failed to load missions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  const completedCount = missions.filter(
    (mission) => mission.status === "Completed"
  ).length;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        🎯 Daily AI Missions
      </h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Mission Progress
        </h2>

        <p className="text-gray-600 mb-4">
          {completedCount} / {missions.length} Completed
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full"
            style={{
              width: `${
                missions.length > 0
                  ? (completedCount / missions.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6">
          <p>No missions available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map((mission) => (
            <div
              key={mission.mission_id}
              className="bg-white rounded-xl shadow p-6"
            >
              <h2 className="text-lg font-bold">
                {mission.title}
              </h2>

              <p className="mt-3">
                Status:
                <span className="ml-2 font-semibold">
                  {mission.status === "Completed"
                    ? "✅ Completed"
                    : "⏳ Pending"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Missions;