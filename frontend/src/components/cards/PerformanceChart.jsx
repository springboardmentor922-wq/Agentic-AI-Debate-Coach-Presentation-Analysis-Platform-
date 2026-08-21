import "./PerformanceChart.css";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
    { day: "Mon", score: 62 },
    { day: "Tue", score: 68 },
    { day: "Wed", score: 72 },
    { day: "Thu", score: 78 },
    { day: "Fri", score: 81 },
    { day: "Sat", score: 84 },
    { day: "Sun", score: 89 },
];

const PerformanceChart = () => {
    return (
        <div className="chart-card">

            <div className="chart-header">

                <div>
                    <h2>Weekly Performance</h2>
                    <p>Your debate performance over the last 7 days</p>
                </div>

                <h2 style={{ color: "#4F46E5" }}>89%</h2>

            </div>

            <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data}>

                    <defs>

                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">

                            <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.5} />

                            <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />

                        </linearGradient>

                    </defs>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="day" />

                    <Tooltip />

                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#4F46E5"
                        fill="url(#colorScore)"
                        strokeWidth={3}
                    />

                </AreaChart>
            </ResponsiveContainer>

        </div>
    );
};

export default PerformanceChart;