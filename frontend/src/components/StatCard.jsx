export default function StatCard({ label, value, icon: Icon, accent = "teal" }) {
  const accentClass = {
    teal: "text-motion-teal",
    coral: "text-rebuttal-coral",
    amber: "text-signal-amber",
  }[accent];

  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="label-eyebrow mb-2">{label}</p>
        <p className="stat-figure">{value}</p>
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center ${accentClass}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
