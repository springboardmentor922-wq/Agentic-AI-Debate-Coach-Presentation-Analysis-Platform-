import React from "react";

function StatCard({ label, value }) {
  return (
    <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default StatCard;
