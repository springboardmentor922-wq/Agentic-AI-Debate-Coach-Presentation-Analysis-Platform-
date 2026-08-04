import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Neha", score: 92 },
  { name: "Rahul", score: 88 },
  { name: "Priya", score: 85 },
  { name: "Amit", score: 81 },
  { name: "Kiran", score: 79 },
];

function TopLearnersChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="score" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default TopLearnersChart;