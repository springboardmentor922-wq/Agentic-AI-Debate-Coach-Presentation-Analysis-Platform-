import { motion } from "framer-motion";
import {
  FaUsers,
  FaChartLine,
  FaTrophy,
  FaBookOpen,
  FaGraduationCap,
  FaArrowRight,
} from "react-icons/fa";

import "../../styles/dashboard.css";

function EducatorDashboard() {
  const students = [
    {
      name: "Archana",
      score: 91,
      status: "Excellent",
    },
    {
      name: "Rahul",
      score: 82,
      status: "Good",
    },
    {
      name: "Sneha",
      score: 75,
      status: "Average",
    },
    {
      name: "Kiran",
      score: 88,
      status: "Very Good",
    },
  ];

  return (
    <div className="learner-dashboard">
      <motion.div
        className="hero-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2>Educator Dashboard 🎓</h2>
          <p>
            Track student performance, monitor progress and improve learning
            outcomes.
          </p>
        </div>

        <FaGraduationCap size={65} />
      </motion.div>

      <div className="stats-grid">
        <div className="stat-card">
          <FaUsers />
          <h4>Total Students</h4>
          <h2>120</h2>
        </div>

        <div className="stat-card">
          <FaChartLine />
          <h4>Average Score</h4>
          <h2>84%</h2>
        </div>

        <div className="stat-card">
          <FaTrophy />
          <h4>Top Performer</h4>
          <h2>Archana</h2>
        </div>

        <div className="stat-card">
          <FaBookOpen />
          <h4>Topics Covered</h4>
          <h2>35</h2>
        </div>
      </div>

      <div className="insight-grid">
        <div className="ai-insights">
          <h3>Class Insights</h3>

          <ul>
            <li>✔ Overall performance increased by 15%</li>
            <li>✔ Confidence is improving steadily</li>
            <li>✔ Logical reasoning needs attention</li>
            <li>✔ 18 students achieved 90%+</li>
          </ul>
        </div>

        <div className="today-card">
          <h3>Today's Recommendation</h3>

          <h2>Practice Logical Reasoning</h2>

          <p>Target Group : Intermediate Students</p>

          <p>Estimated Duration : 30 Minutes</p>

          <button>
            View Report <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="history-card">
        <h3>Overall Student Progress</h3>

        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.score}%</td>
                <td>{student.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>

        <div className="activity-item">
          <span>📊 Weekly Report Generated</span>
          <span>Today</span>
        </div>

        <div className="activity-item">
          <span>🏆 New Top Performer</span>
          <span>Archana</span>
        </div>

        <div className="activity-item">
          <span>📚 New Debate Topic Added</span>
          <span>2 hrs ago</span>
        </div>
      </div>
    </div>
  );
}

export default EducatorDashboard;