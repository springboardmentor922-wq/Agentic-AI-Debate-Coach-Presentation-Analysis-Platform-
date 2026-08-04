import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", users: 10 },
  { month: "Feb", users: 18 },
  { month: "Mar", users: 28 },
  { month: "Apr", users: 40 },
  { month: "May", users: 55 },
];

function PlatformGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line dataKey="users" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PlatformGrowthChart;