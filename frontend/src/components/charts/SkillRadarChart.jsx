// components/charts/SkillRadarChart.jsx

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from "recharts";

const data = [
  { skill: "Argument", score: 88 },
  { skill: "Evidence", score: 72 },
  { skill: "Logic", score: 91 },
  { skill: "Rebuttal", score: 80 },
  { skill: "Communication", score: 85 },
];

export default function SkillRadarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis />
        <Radar
          dataKey="score"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}