import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import {
  getCoachDashboard,
  getAssignedLearners,
  getCoachNotes,
  getAttentionLearners
} from "../../services/dashboardService";
import StudentPerformanceChart from "../../components/charts/StudentPerformanceChart";
import SkillGapChart from "../../components/charts/SkillGapChart";
import TopLearnersChart from "../../components/charts/TopLearnersChart";
function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [learners, setLearners] = useState([]);
  const [notes, setNotes] = useState([]);
  const [attentionLearners, setAttentionLearners] = useState([]);
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getCoachDashboard();
        console.log("Coach Dashboard:", data);
        setDashboardData(data);

        const learnerData = await getAssignedLearners();
        console.log("Assigned Learners:", learnerData);
        setLearners(learnerData);

        const noteData = await getCoachNotes();
        setNotes(noteData);

        const attentionData = await getAttentionLearners();
        setAttentionLearners(attentionData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600 font-bold">
          Dashboard Data Not Loaded
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Coach Dashboard
      </h1>

      {/* Top Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">

        <Card title="Total Learners" value={dashboardData.total_students} />
        <Card title="Active Learners" value="18" />
        <Card title="Average Score" value="84%" />
        <Card title="Debates Reviewed" value="156" />
        <Card title="Improvement Rate" value="+12%" />
        <Card title="Top Performer" value="Neha" />

      </div>

      {/* Coaching Insights */}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            Student Performance Trend
          </h2>

          <div className="h-[300px]">
            <StudentPerformanceChart />
          </div>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            Skill Gap Distribution
          </h2>

          <div className="h-[300px]">
            <SkillGapChart />
          </div>

        </div>

      </div>

      {/* Top Learner Performance */}

      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          🏆 Top Learners
        </h2>

        <TopLearnersChart />

      </div>

      {/* Recent Activity & AI Insights */}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            👩‍🎓 Recent Student Activity
          </h2>

          <ul className="space-y-3">
            <li>Neha - AI Debate - Score 82</li>
            <li>Rahul - Oxford Debate - Score 76</li>
            <li>Priya - Policy Debate - Score 88</li>
          </ul>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            🤖 AI Coaching Insights
          </h2>

          <ul className="space-y-3">
            <li>📌 Learners need stronger evidence.</li>
            <li>📌 Counterarguments are improving.</li>
            <li>📌 Confidence scores increased.</li>
          </ul>

        </div>

      </div>
      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          👨‍🎓 Assigned Learners
        </h2>

        {learners.length === 0 ? (
          <p>No learners assigned.</p>
        ) : (
          <ul className="space-y-3">

            {learners.map((learner) => (

              <li
                key={learner.assignment_id}
                className="border-b pb-2"
              >
                {learner.full_name}
              </li>

            ))}

          </ul>
        )}

      </div>
      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          📝 Coach Notes
        </h2>

        {notes.length === 0 ? (
          <p>No notes available.</p>
        ) : (
          <div className="space-y-4">

            {notes.map((note) => (

              <div
                key={note.note_id}
                className="border rounded-lg p-4"
              >

                <h3 className="font-semibold">
                  👨‍🎓 {note.learner_name}
                </h3>

                <p className="mt-2 text-gray-700">
                  {note.note}
                </p>

              </div>

            ))}

          </div>
        )}

      </div>
      <div className="mt-8 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4 text-red-600">
          🚨 Learners Needing Attention
        </h2>

        {attentionLearners.map((learner) => (

          <div
            key={learner.learner_name}
            className="border-b py-3"
          >

            <p className="font-semibold">
              {learner.learner_name}
            </p>

            <p>
              Average Score:
              {" "}
              {learner.average_score}
            </p>

            <p className="text-red-500">
              {learner.reason}
            </p>

          </div>

        ))}

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;