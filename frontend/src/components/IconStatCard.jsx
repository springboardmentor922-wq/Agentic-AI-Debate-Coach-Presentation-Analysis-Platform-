import React from "react";

const COLOR_MAP = {
  purple: { bg: "bg-purple-600/20", text: "text-purple-400" },
  blue: { bg: "bg-blue-600/20", text: "text-blue-400" },
  green: { bg: "bg-green-600/20", text: "text-green-400" },
  orange: { bg: "bg-orange-600/20", text: "text-orange-400" },
  red: { bg: "bg-red-600/20", text: "text-red-400" },
  teal: { bg: "bg-teal-600/20", text: "text-teal-400" },
};

function IconStatCard({ icon, label, value, sublabel, color = "purple" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.purple;
  return (
    <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="text-2xl font-bold text-white truncate">{value}</p>
        {sublabel && <p className="text-gray-500 text-xs mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export default IconStatCard;
