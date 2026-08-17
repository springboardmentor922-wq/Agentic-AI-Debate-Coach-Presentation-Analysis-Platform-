import { motion } from "framer-motion";
import {
  FaUsers,
  FaComments,
  FaMicrophone,
  FaChartLine,
  FaServer,
  FaShieldAlt,
  FaDatabase,
  FaArrowRight,
} from "react-icons/fa";

import "../../styles/dashboard.css";

function AdminDashboard() {
  const activities = [
    {
      action: "New User Registered",
      value: "Today",
    },
    {
      action: "5 Debate Topics Added",
      value: "Today",
    },
    {
      action: "Database Backup Completed",
      value: "Success",
    },
    {
      action: "System Health",
      value: "99.8%",
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
          <h2>Administrator Dashboard ⚙️</h2>
          <p>
            Monitor the entire platform, manage users and ensure smooth system
            performance.
          </p>
        </div>

        <FaServer size={65} />
      </motion.div>

      <div className="stats-grid">
        <div className="stat-card">
          <FaUsers />
          <h4>Total Users</h4>
          <h2>320</h2>
        </div>

        <div className="stat-card">
          <FaComments />
          <h4>Debate Topics</h4>
          <h2>48</h2>
        </div>

        <div className="stat-card">
          <FaMicrophone />
          <h4>Sessions</h4>
          <h2>890</h2>
        </div>

        <div className="stat-card">
          <FaChartLine />
          <h4>Active Users</h4>
          <h2>78</h2>
        </div>
      </div>

      <div className="insight-grid">
        <div className="ai-insights">
          <h3>System Insights</h3>

          <ul>
            <li>✔ Platform uptime: 99.8%</li>
            <li>✔ No security alerts detected</li>
            <li>✔ Database performance is healthy</li>
            <li>✔ AI services are online</li>
          </ul>
        </div>

        <div className="today-card">
          <h3>Administrator Controls</h3>

          <p>👤 Manage Users</p>
          <p>📝 Manage Debate Topics</p>
          <p>🎤 Manage Debate Sessions</p>
          <p>📊 View Reports</p>
          <p>🛡 System Monitoring</p>

          <button>
            Open Admin Panel <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <div className="action-card">
          <div className="action-icon">
            <FaUsers />
          </div>
          <h4>Users</h4>
        </div>

        <div className="action-card">
          <div className="action-icon">
            <FaShieldAlt />
          </div>
          <h4>Security</h4>
        </div>

        <div className="action-card">
          <div className="action-icon">
            <FaDatabase />
          </div>
          <h4>Database</h4>
        </div>

        <div className="action-card">
          <div className="action-icon">
            <FaChartLine />
          </div>
          <h4>Reports</h4>
        </div>
      </div>

      <div className="recent-activity">
        <h3>System Activity</h3>

        {activities.map((item, index) => (
          <div className="activity-item" key={index}>
            <span>{item.action}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;