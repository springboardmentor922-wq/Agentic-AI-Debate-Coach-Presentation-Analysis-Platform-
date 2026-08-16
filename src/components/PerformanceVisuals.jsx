const COLORS = ["#312e81", "#5b21b6", "#7c3aed", "#a78bfa"];

export function ScoreRing({ score = 0, label = "Overall score" }) {
  const value = Math.max(0, Math.min(10, Number(score) || 0));
  const degrees = value * 36;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="grid h-36 w-36 place-items-center rounded-full"
        style={{ background: `conic-gradient(#7c3aed ${degrees}deg, #e2e8f0 ${degrees}deg)` }}
      >
        <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center shadow-inner">
          <span className="text-3xl font-bold text-slate-900">{value.toFixed(1)}</span>
          <span className="text-xs font-medium text-slate-500">out of 10</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}

export function SkillBars({ scores = {} }) {
  const skills = [
    ["Clarity", scores.clarity_score],
    ["Logic", scores.logic_score],
    ["Persuasiveness", scores.persuasiveness_score],
    ["Grammar", scores.grammar_score],
  ];

  return (
    <div className="space-y-5">
      {skills.map(([name, score], index) => {
        const value = Math.max(0, Math.min(10, Number(score) || 0));
        return (
          <div key={name}>
            <div className="mb-2 flex justify-between text-sm font-medium text-slate-700">
              <span>{name}</span><span>{value}/10</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${value * 10}%`, backgroundColor: COLORS[index] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ActivityChart({ scores = [] }) {
  const values = scores.length ? scores.slice(-6) : [5.8, 6.4, 6.8, 7.2, 7.6, 8.1];
  const points = values.map((value, index) => `${index * (100 / Math.max(values.length - 1, 1))},${92 - (Number(value) || 0) * 8}`).join(" ");

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-slate-900">Performance trend</h3><span className="text-xs text-slate-500">Last 6 sessions</span></div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-36 w-full overflow-visible">
        {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />)}
        <polyline points={points} fill="none" stroke="#7c3aed" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {values.map((value, index) => <circle key={index} cx={index * (100 / Math.max(values.length - 1, 1))} cy={92 - (Number(value) || 0) * 8} r="2" fill="#7c3aed" vectorEffect="non-scaling-stroke" />)}
      </svg>
    </div>
  );
}
