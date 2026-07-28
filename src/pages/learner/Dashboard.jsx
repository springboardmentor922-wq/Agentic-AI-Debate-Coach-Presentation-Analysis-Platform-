import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ChatBot from "../../components/chatbot/ChatBot";
function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
  totalDebates: 0,
  averageScore: 0,
  bestScore: 0,
  streak: 7, // Replace with backend value later
});

const [history, setHistory] = useState([]);
useEffect(() => {
  loadDashboard();
}, []);

async function loadDashboard() {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/analysis/history"
    );

    const data = response.data;

    setHistory(data);

    if (data.length > 0) {
      const totalDebates = data.length;

      const averageScore =
        (
          data.reduce((sum, item) => sum + item.overall_score, 0) /
          totalDebates
        ).toFixed(1);

      const bestScore = Math.max(
        ...data.map((item) => item.overall_score)
      );

      setStats({
        totalDebates,
        averageScore,
        bestScore,
        streak: 7,
      });
    }
  } catch (err) {
    console.log(err);
  }
}
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
              Welcome Back 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Continue improving your debating skills with AI and track your
              performance.
            </p>
          </div>

          {/* Statistics */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  ...
</div>

{/* Quick Actions */}
<div className="bg-white rounded-xl shadow mt-8 p-6">

  <h2 className="text-2xl font-bold mb-6">
    Quick Actions
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

    <button
      onClick={() => navigate("/debate")}
      className="bg-green-700 hover:bg-green-800 text-white rounded-lg p-6 transition"
    >
      <h3 className="text-xl font-semibold">
        🎤 Start Debate
      </h3>

      <p className="mt-2 text-sm">
        Begin a new AI-powered debate session.
      </p>
    </button>

    <button
      onClick={() => navigate("/learner/history")}
      className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 transition"
    >
      <h3 className="text-xl font-semibold">
        📜 Analysis History
      </h3>

      <p className="mt-2 text-sm">
        View previous AI reports.
      </p>
    </button>

    <button
      onClick={() => navigate("/profile")}
      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 transition"
    >
      <h3 className="text-xl font-semibold">
        👤 My Profile
      </h3>

      <p className="mt-2 text-sm">
        Update your personal profile.
      </p>
    </button>

    <button
      onClick={() => navigate("/learner/analytics")}
      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-6 transition"
    >
      <h3 className="text-xl font-semibold">
        📈 Analytics
      </h3>

      <p className="mt-2 text-sm">
        View performance charts.
      </p>
    </button>

  </div>

</div>
          {/* Recent Debates */}
          <div className="bg-white rounded-xl shadow mt-8 p-6">
            <h2 className="text-2xl font-bold mb-6">
              Recent Debates
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-4">Topic</th>
                    <th className="text-left p-4">Difficulty</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Score</th>
                  </tr>
                </thead>

                <tbody>

{history.length > 0 ? (

history.map((item) => (

<tr
    key={item.id}
    className="border-b hover:bg-gray-50"
>

<td className="p-4">

{item.argument.length > 40
? item.argument.substring(0,40)+"..."
: item.argument}

</td>

<td className="p-4">

{item.fallacy_type || "None"}

</td>

<td className="p-4 text-green-600 font-semibold">

Completed

</td>

<td className="p-4">

{item.overall_score}/10

</td>

</tr>

))

) : (

<tr>

<td
colSpan="4"
className="text-center p-6"
>

No debates found.

</td>

</tr>

)}

</tbody>
              </table>
            </div>
          </div>

          {/* Motivational Card */}
          <div className="bg-gradient-to-r from-green-700 to-green-500 text-white rounded-xl shadow mt-8 p-8">
            <h2 className="text-2xl font-bold">
              Keep Practicing 🚀
            </h2>

            <p className="mt-3">
              Every debate improves your confidence, communication skills, and
              critical thinking. Stay consistent and climb the leaderboard!
            </p>
          </div>
          <div className="bg-white rounded-xl shadow mt-8 p-8">

<h2 className="text-2xl font-bold text-green-700">

🧠 AI Recommendations

</h2>

<p className="mt-3 text-gray-600">

Based on your recent debate performance:

</p>

<ul className="list-disc ml-6 mt-5 space-y-2">

<li>Improve evidence quality by using factual examples.</li>

<li>Reduce logical fallacies in your arguments.</li>

<li>Practice persuasive language for stronger conclusions.</li>

<li>Try debating "Artificial Intelligence".</li>

<li>Try debating "Climate Change".</li>

</ul>
<ChatBot />
</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;