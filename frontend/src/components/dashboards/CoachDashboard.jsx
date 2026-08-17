import { motion } from "framer-motion";
import {
  FaClipboardCheck,
  FaUsers,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

import "../../styles/dashboard.css";

function CoachDashboard() {
  const reviews = [
    {
      learner: "Archana",
      topic: "AI in Education",
      score: 87,
      status: "Pending",
    },
    {
      learner: "Rahul",
      topic: "Climate Change",
      score: 82,
      status: "Pending",
    },
    {
      learner: "Sneha",
      topic: "Technology",
      score: 91,
      status: "Reviewed",
    },
    {
      learner: "Kiran",
      topic: "Renewable Energy",
      score: 85,
      status: "Pending",
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
          <h2>Coach Dashboard 👨‍🏫</h2>
          <p>
            Review debates, guide learners, and monitor their improvement.
          </p>
        </div>

        <FaClipboardCheck size={65} />
      </motion.div>

      <div className="stats-grid">
        <div className="stat-card">
          <FaClipboardCheck />
          <h4>Pending Reviews</h4>
          <h2>12</h2>
        </div>

        <div className="stat-card">
          <FaCheckCircle />
          <h4>Completed Reviews</h4>
          <h2>48</h2>
        </div>

        <div className="stat-card">
          <FaClock />
          <h4>Today's Sessions</h4>
          <h2>5</h2>
        </div>

        <div className="stat-card">
          <FaUsers />
          <h4>Learners Waiting</h4>
          <h2>8</h2>
        </div>
      </div>

      <div className="insight-grid">
        <div className="ai-insights">
          <h3>Coach Insights</h3>

          <ul>
            <li>✔ 8 learners waiting for review</li>
            <li>✔ Average AI score increased by 12%</li>
            <li>✔ Logic is the weakest skill</li>
            <li>✔ Confidence is improving consistently</li>
          </ul>
        </div>

        <div className="today-card">
          <h3>Today's Priority</h3>

          <h2>Review Pending Debates</h2>

          <p>Estimated Time : 45 Minutes</p>

          <p>High Priority</p>

          <button>
            Start Reviewing <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="history-card">
        <h3>Recent Debate Reviews</h3>

        <table>
          <thead>
            <tr>
              <th>Learner</th>
              <th>Topic</th>
              <th>AI Score</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((item, index) => (
              <tr key={index}>
                <td>{item.learner}</td>
                <td>{item.topic}</td>
                <td>{item.score}%</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>

        <div className="activity-item">
          <span>📝 Review Submitted</span>
          <span>2 min ago</span>
        </div>

        <div className="activity-item">
          <span>🎤 New Debate Assigned</span>
          <span>10 min ago</span>
        </div>

        <div className="activity-item">
          <span>⭐ Learner Rating Updated</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

export default CoachDashboard;