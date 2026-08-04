import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

const SkillProgress = ({ userId }) => {
  const [data, setData] = useState([]);
  const [improvement, setImprovement] = useState({
    communication: 0,
    argument: 0,
    confidence: 0
  });

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/skills/${userId}`)
      .then(res => res.json())
      .then(res => {
        const formattedData = (res.sessions || []).map(session => ({
          ...session,
          date: new Date(session.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          })
        }));

        setData(formattedData);
        setImprovement(res.improvement || {});
      });
  }, [userId]);

  return (
    <div className="mt-2 px-0">

      <h2 className="text-xl font-bold mb-4">
        📊 Skill Progress
      </h2>

      {/* 🔥 Improvement Section */}
      <div className="mb-6 bg-[#1a1a2b] border border-white/5 p-4 rounded-2xl text-center">
        <p className="font-medium">📢 Communication: +{improvement.communication}</p>
        <p className="font-medium">🧠 Argument: +{improvement.argument}</p>
        <p className="font-medium">🔥 Confidence: +{improvement.confidence}</p>
      </div>

      {/* 📈 Responsive Chart */}
      <div className="bg-[#1a1a2b] border border-white/5 p-4 rounded-2xl">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />

            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="communicationScore"
              stroke="#a855f7"
              strokeWidth={2}
              name="Communication"
            />

            <Line
              type="monotone"
              dataKey="argumentScore"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Argument"
            />

            <Line
              type="monotone"
              dataKey="confidenceScore"
              stroke="#ff7300"
              strokeWidth={2}
              name="Confidence"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillProgress;
