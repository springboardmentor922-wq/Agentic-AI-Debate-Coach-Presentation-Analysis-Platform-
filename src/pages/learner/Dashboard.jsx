import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();   
  return (
    <div className="flex bg-slate-100 min-h-screen">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">

        {/* Navbar */}
        <Navbar />

        <div className="p-8">

          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Welcome Back 👋
          </h1>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <StatCard title="Total Debates" value="12" />

            <StatCard title="Average Score" value="87%" />

            <StatCard title="Skill Level" value="Intermediate" />

          </div>

          {/* Start Debate Section */}
          <div className="bg-white mt-8 rounded-xl shadow p-8">

            <h2 className="text-2xl font-bold mb-4">
              Ready for a New Debate?
            </h2>

            <p className="text-gray-500 mb-6">
              Practice with AI, improve your reasoning, and track your progress.
            </p>

           <button
  onClick={() => navigate("/debate")}
  className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg"
>
  Start Debate
</button>

          </div>

          {/* Recent Debates */}
          <div className="bg-white mt-8 rounded-xl shadow p-8">

            <h2 className="text-2xl font-bold mb-4">
              Recent Debates
            </h2>

            <ul className="space-y-3 text-gray-700">

              <li>🌍 Climate Change</li>

              <li>🤖 AI in Education</li>

              <li>⚡ Renewable Energy</li>

            </ul>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;