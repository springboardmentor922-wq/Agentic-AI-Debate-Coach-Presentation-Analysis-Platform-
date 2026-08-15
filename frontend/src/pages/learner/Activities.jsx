import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/common/Spinner";
import { getLearningActivities } from "../../services/dashboardService";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getLearningActivities();
        setActivities(data);
      } catch (error) {
        console.error("Failed to load activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
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
        📚 Learning Activities
      </h1>

      {activities.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            No learning activities available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.activity_id}
              className="bg-white rounded-xl shadow p-6"
            >
              <h2 className="text-xl font-bold">
                {activity.title}
              </h2>

              <p className="text-gray-500 mt-2">
                Type: {activity.activity_type}
              </p>

              <p className="mt-3">
                Status:{" "}
                <span className="font-semibold">
                  {activity.status}
                </span>
              </p>

              <p className="mt-2">
                Score:{" "}
                <span className="font-semibold">
                  {activity.score}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Activities;