import {
  Line,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import "./PerformanceChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function PerformanceChart({ summary }) {

  const data = {
    labels: [
      "Grammar",
      "Logic",
      "Confidence",
      "Relevance",
    ],

    datasets: [
      {
        label: "Performance",

        data: [
          summary.average_grammar,
          summary.average_logic,
          summary.average_confidence,
          summary.average_relevance,
        ],

        borderColor: "#6366F1",

        backgroundColor: "rgba(99,102,241,.15)",

        fill: true,

        tension: .4,

        pointRadius: 6,

        pointBackgroundColor: "#6366F1",
      },
    ],
  };

  return (

    <div className="performance-chart-card">

      <h3>Performance Analytics</h3>

      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />

    </div>

  );
}

export default PerformanceChart;