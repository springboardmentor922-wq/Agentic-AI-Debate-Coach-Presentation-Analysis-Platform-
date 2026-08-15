import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import {
  getLearnerDashboard,
  getMyCoach,
  getLearningActivities,
  getDailyMissions,
  getCoachMessages,
  sendCoachMessage,
  getMyMessages

} from "../../services/dashboardService";
import SkillRadarChart from "../../components/charts/SkillRadarChart";
import PerformanceChart from "../../components/charts/PerformanceChart";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [coach, setCoach] = useState(null);
  const [activities, setActivities] = useState([]);
  const [missions, setMissions] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [coachMessage, setCoachMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getLearnerDashboard();
        setDashboardData(data);

        const coachData = await getMyCoach();
        setCoach(coachData);

        const activityData = await getLearningActivities();
        setActivities(activityData);

        const missionData = await getDailyMissions();
        setMissions(missionData);

        const messageData = await getCoachMessages();
        setMessages(messageData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }
  const handleSendMessage = async () => {

    if (!coachMessage.trim()) {
      return;
    }

    try {

      setSendingMessage(true);

      const newMessage = await sendCoachMessage({
        learner_id: 1,
        coach_id: 2,
        message: coachMessage
      });

      setMessages((prev) => [
        ...prev,
        {
          message_id: newMessage.message_id,
          learner_name: "You",
          message: newMessage.message,
          status: newMessage.status
        }
      ]);

      setCoachMessage("");
      setShowMessageForm(false);

    } catch (error) {

      console.error("Failed to send message:", error);

    } finally {

      setSendingMessage(false);

    }
  };

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Welcome to Learner Dashboard 👋
      </h1>

      {/* Welcome Banner */}

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h2 className="text-2xl font-bold">
          Agentic AI Debate Coach 🚀
        </h2>
        <p className="mt-2">
          Improve your debating skills with AI-powered coaching,
          scoring, fallacy detection and personalized feedback.
        </p>
      </div>
      <div className="bg-white rounded-xl p-5 shadow mb-6">

        <div className="flex justify-between mb-2">

          <span className="font-semibold">
            Intermediate Level
          </span>

          <span>
            1250 / 2000 XP
          </span>

        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className="bg-indigo-600 h-3 rounded-full"
            style={{ width: "62%" }}
          />

        </div>

      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <h2 className="text-xl font-bold mb-3">
          👨‍🏫 My Coach
        </h2>

        <p className="text-lg">
          {coach?.coach_name || "Not Assigned"}
        </p>

        <p className="text-gray-500 mt-2">
          Assigned Debate Coach
        </p>

      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <h2 className="text-xl font-bold mb-4">
          📚 Learning Activities
        </h2>

        {activities.length === 0 ? (
          <p>No activities available.</p>
        ) : (
          <div className="space-y-3">

            {activities.map((activity) => (
              <div
                key={activity.activity_id}
                className="border rounded-lg p-4"
              >

                <h3 className="font-semibold">
                  {activity.title}
                </h3>

                <p className="text-gray-600">
                  Type: {activity.activity_type}
                </p>

                <p>
                  Status:
                  <span className="ml-2 font-medium">
                    {activity.status}
                  </span>
                </p>

                <p>
                  Score:
                  <span className="ml-2 font-medium">
                    {activity.score}
                  </span>
                </p>

              </div>
            ))}

          </div>
        )}

      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <h2 className="text-xl font-bold mb-2">
          🎯 Daily AI Missions
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          {
            missions.filter(
              (m) => m.status === "Completed"
            ).length
          }
          /
          {missions.length}
          {" "}Completed
        </p>

        <div className="space-y-3">

          {missions.map((mission) => (

            <div
              key={mission.mission_id}
              className="flex justify-between border-b pb-2"
            >

              <span>
                {mission.title}
              </span>

              <span>
                {mission.status === "Completed"
                  ? "✅"
                  : "⏳"}
              </span>

            </div>

          ))}

        </div>

      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-xl font-bold">
            📩 Contact My Coach
          </h2>

          <span className="text-sm text-gray-500">
            Coach Support
          </span>

        </div>

        <div className="bg-indigo-50 rounded-lg p-4">

          <p className="font-semibold">
            Need help with your debate?
          </p>

          <p className="text-gray-600 text-sm mt-1">
            Ask your coach for guidance, feedback, or debate improvement tips.
          </p>

          <button
            onClick={() => setShowMessageForm(!showMessageForm)}
            className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            💬 Ask My Coach
          </button>
          {showMessageForm && (
            <div className="mt-4">

              <textarea
                value={coachMessage}
                onChange={(e) => setCoachMessage(e.target.value)}
                placeholder="Ask your coach about your debate, arguments, evidence, rebuttals..."
                className="w-full border rounded-lg p-3 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex justify-end mt-3">

                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sendingMessage ? "Sending..." : "📤 Send to Coach"}
                </button>

              </div>

            </div>
          )}

        </div>

      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <h2 className="text-xl font-bold mb-4">
          📬 My Coach Requests
        </h2>

        {messages.length === 0 ? (

          <p className="text-gray-500">
            You haven't sent any requests yet.
          </p>

        ) : (

          <div className="space-y-4">

            {messages.map((message) => (

              <div
                key={message.message_id}
                className="border rounded-lg p-4"
              >

                <div className="flex justify-between">

                  <p className="font-semibold">
                    👨‍🏫 {message.learner_name}
                  </p>

                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      message.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {message.status}
                  </span>

                </div>

                <p className="text-gray-600 mt-2">
                  {message.message}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* Top Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">

        <Card
          title="Total Debates"
          value={dashboardData.total_debates}
        />

        <Card
          title="Average Score"
          value={`${dashboardData.average_score}%`}
        />

        <Card
          title="Fallacies Found"
          value={dashboardData.fallacies_found}
        />

        <Card
          title="AI Feedback"
          value={dashboardData.ai_feedback}
        />
        <Card
          title="Current Rank"
          value="#5"
        />

        <Card
          title="Debate Streak"
          value="🔥 7 Days"
        />

      </div>

      {/* Progress + Recommendations */}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Skill Analysis */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            📈 Skill Analysis
          </h2>

          <SkillRadarChart />

        </div>

        {/* AI Recommendations */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            🎯 AI Recommendations
          </h2>

          <ul className="space-y-3">
            <li>📌 Add more evidence to arguments.</li>
            <li>📌 Improve rebuttal structure.</li>
            <li>📌 Avoid absolute claims.</li>
            <li>📌 Use statistics when possible.</li>
          </ul>

        </div>

      </div>

      {/* Recent Scores */}

      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          📈 Performance Trend
        </h2>

        <PerformanceChart />

      </div>

      {/* Next Challenge */}

      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          🔥 Next Challenge
        </h2>

        <p className="text-gray-700">
          Should Social Media Be Regulated by Governments?
        </p>

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;