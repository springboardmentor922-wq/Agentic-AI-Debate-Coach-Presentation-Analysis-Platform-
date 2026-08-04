import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", score: 70 },
  { month: "Feb", score: 75 },
  { month: "Mar", score: 82 },
  { month: "Apr", score: 88 },
  { month: "May", score: 92 },
];

function StudentPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default StudentPerformanceChart;