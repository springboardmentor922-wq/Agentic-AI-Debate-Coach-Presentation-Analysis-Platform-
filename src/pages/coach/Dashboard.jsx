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
              Welcome, Debate Coach 🎤
            </h1>

            <p className="text-gray-500 mt-2">
              Review learner debates, provide feedback, and help students improve
              their communication skills.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Assigned Learners" value="24" />

            <StatCard title="Pending Reviews" value="8" />

            <StatCard title="Completed Reviews" value="52" />

            <StatCard title="Average Rating" value="4.8/5" />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow mt-8 p-6">
            <h2 className="text-2xl font-bold mb-6">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="bg-green-700 hover:bg-green-800 text-white rounded-lg p-6 transition">
                <h3 className="text-xl font-semibold">📝 Review Debate</h3>

                <p className="mt-2 text-sm">
                  Review learner debate submissions.
                </p>
              </button>

              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 transition">
                <h3 className="text-xl font-semibold">💬 Give Feedback</h3>

                <p className="mt-2 text-sm">
                  Share suggestions for improvement.
                </p>
              </button>

              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 transition">
                <h3 className="text-xl font-semibold">📊 View Analytics</h3>

                <p className="mt-2 text-sm">
                  Analyze learner performance.
                </p>
              </button>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow mt-8 p-6">
            <h2 className="text-2xl font-bold mb-6">
              Review Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="border rounded-lg p-6">
                <p className="text-4xl font-bold text-green-700">52</p>

                <p className="mt-2 text-gray-600">
                  Reviews Completed
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <p className="text-4xl font-bold text-orange-500">8</p>

                <p className="mt-2 text-gray-600">
                  Pending Reviews
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <p className="text-4xl font-bold text-blue-600">24</p>

                <p className="mt-2 text-gray-600">
                  Active Learners
                </p>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow mt-8 p-6">
            <h2 className="text-2xl font-bold mb-6">
              Recent Debate Reviews
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-4">Learner</th>
                    <th className="text-left p-4">Topic</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Rating</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">Rahul</td>
                    <td className="p-4">Climate Change</td>
                    <td className="p-4 text-green-600 font-semibold">
                      Reviewed
                    </td>
                    <td className="p-4">4.8 ⭐</td>
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">Ananya</td>
                    <td className="p-4">AI in Education</td>
                    <td className="p-4 text-orange-500 font-semibold">
                      Pending
                    </td>
                    <td className="p-4">--</td>
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="p-4">Kiran</td>
                    <td className="p-4">Renewable Energy</td>
                    <td className="p-4 text-green-600 font-semibold">
                      Reviewed
                    </td>
                    <td className="p-4">4.6 ⭐</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Coach Message */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-xl shadow mt-8 p-8">
            <h2 className="text-2xl font-bold">
              Guide. Inspire. Improve. 🎯
            </h2>

            <p className="mt-3">
              Your feedback helps learners build confidence, critical thinking,
              and effective communication. Every review contributes to their
              growth.
            </p>
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  );
}

export default Dashboard;