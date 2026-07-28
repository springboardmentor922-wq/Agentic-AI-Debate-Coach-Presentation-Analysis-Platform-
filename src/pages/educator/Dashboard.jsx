import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import ChatBot from "../../components/chatbot/ChatBot";

function Dashboard() {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Navbar */}
        <Navbar />

        <div className="p-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, Educator 👨‍🏫
            </h1>

            <p className="text-gray-500 mt-2">
              Manage students, assign debate topics, and monitor classroom
              performance.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Students" value="120" />

            <StatCard title="Active Classes" value="6" />

            <StatCard title="Debates Assigned" value="35" />

            <StatCard title="Average Score" value="89%" />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow mt-8 p-6">
            <h2 className="text-2xl font-bold mb-6">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="bg-green-700 hover:bg-green-800 text-white rounded-lg p-6 transition">
                <h3 className="text-xl font-semibold">📚 Assign Debate</h3>

                <p className="mt-2 text-sm">
                  Assign new debate topics to students.
                </p>
              </button>

              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 transition">
                <h3 className="text-xl font-semibold">👨‍🎓 Manage Students</h3>

                <p className="mt-2 text-sm">
                  View and organize student information.
                </p>
              </button>

              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 transition">
                <h3 className="text-xl font-semibold">📊 View Reports</h3>

                <p className="mt-2 text-sm">
                  Analyze classroom performance reports.
                </p>
              </button>
            </div>
          </div>

          {/* Class Overview */}
          <div className="bg-white rounded-xl shadow mt-8 p-6">
            <h2 className="text-2xl font-bold mb-6">
              Class Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="border rounded-lg p-6">
                <p className="text-4xl font-bold text-green-700">120</p>

                <p className="mt-2 text-gray-600">
                  Registered Students
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <p className="text-4xl font-bold text-blue-600">35</p>

                <p className="mt-2 text-gray-600">
                  Debates Assigned
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <p className="text-4xl font-bold text-orange-500">89%</p>

                <p className="mt-2 text-gray-600">
                  Average Performance
                </p>
              </div>
            </div>
          </div>

          {/* Student Activity */}
          <div className="bg-white rounded-xl shadow mt-8 p-6">
            <h2 className="text-2xl font-bold mb-6">
              Recent Student Activity
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-4">Student</th>
                    <th className="text-left p-4">Debate Topic</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Score</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">Rahul</td>
                    <td className="p-4">Climate Change</td>
                    <td className="p-4 text-green-600 font-semibold">
                      Completed
                    </td>
                    <td className="p-4">92%</td>
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">Ananya</td>
                    <td className="p-4">AI in Education</td>
                    <td className="p-4 text-orange-500 font-semibold">
                      Ongoing
                    </td>
                    <td className="p-4">--</td>
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="p-4">Kiran</td>
                    <td className="p-4">Renewable Energy</td>
                    <td className="p-4 text-green-600 font-semibold">
                      Completed
                    </td>
                    <td className="p-4">95%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Motivation Card */}
          <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-xl shadow mt-8 p-8">
            <h2 className="text-2xl font-bold">
              Inspire the Next Generation 🌟
            </h2>

            <p className="mt-3">
              Empower students with engaging debates that improve communication,
              confidence, and critical thinking skills.
            </p>
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  );
}

export default Dashboard;