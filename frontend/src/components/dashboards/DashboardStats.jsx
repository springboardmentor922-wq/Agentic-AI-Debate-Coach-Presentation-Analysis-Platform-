import {
  FaMicrophone,
  FaChartLine,
  FaTrophy,
  FaFire,
} from "react-icons/fa";

import "./DashboardStats.css";

function DashboardStats({ summary }) {
  const cards = [
    {
      title: "Total Debates",
      value: summary?.total_debates ?? 0,
      icon: <FaMicrophone />,
      color: "#4F46E5",
    },
    {
      title: "Average Score",
      value: `${summary?.average_score ?? 0}%`,
      icon: <FaChartLine />,
      color: "#10B981",
    },
    {
      title: "Highest Score",
      value: summary?.highest_score ?? 0,
      icon: <FaTrophy />,
      color: "#F59E0B",
    },
    {
      title: "Current Grade",
      value: summary?.grade ?? "-",
      icon: <FaFire />,
      color: "#EF4444",
    },
  ];

  return (
    <div className="dashboard-stats">

      {cards.map((card, index) => (

        <div className="dashboard-stat-card" key={index}>

          <div
            className="dashboard-stat-icon"
            style={{ background: card.color }}
          >
            {card.icon}
          </div>

          <div>

            <p>{card.title}</p>

            <h2>{card.value}</h2>

          </div>

        </div>

      ))}

    </div>
  );
}

export default DashboardStats;