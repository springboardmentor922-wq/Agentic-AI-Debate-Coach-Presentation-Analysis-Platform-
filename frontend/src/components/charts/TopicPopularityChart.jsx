import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { topic: "AI Ethics", debates: 40 },
  { topic: "Climate", debates: 35 },
  { topic: "Education", debates: 28 },
  { topic: "Politics", debates: 20 },
];

function TopicPopularityChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="topic" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="debates" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default TopicPopularityChart;