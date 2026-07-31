import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getDashboardStats } from "../../services/dashboardService";
  import Spinner from "../../components/common/Spinner";
function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);


  if (!stats) {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <Spinner />
    </DashboardLayout>
  );
}

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Learners</h2>
          <p className="text-4xl font-bold">
            {stats.total_learners}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Coaches</h2>
          <p className="text-4xl font-bold">
            {stats.total_coaches}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Educators</h2>
          <p className="text-4xl font-bold">
            {stats.total_educators}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Administrators</h2>
          <p className="text-4xl font-bold">
            {stats.total_admins}
          </p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold mb-4">
      System Status
    </h2>

    <div className="space-y-3">
      <p>🟢 AI Service: Online</p>
      <p>🟢 Database: Connected</p>
      <p>🟢 Authentication: Active</p>
      <p>🟢 Platform Status: Healthy</p>
    </div>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold mb-4">
      Recent Users
    </h2>

    <ul className="space-y-3">
      <li>👤 Neha</li>
      <li>👤 Rahul</li>
      <li>👤 Priya</li>
      <li>👤 Anjali</li>
    </ul>
  </div>

</div>
    </DashboardLayout>
  );
}

export default Dashboard;