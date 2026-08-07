import { useEffect, useState } from "react";
import { Users, UserPlus, X, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function CoachLearners() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAssign, setShowAssign] = useState(false);
  const [allLearners, setAllLearners] = useState([]);
  const [selected, setSelected] = useState("");
  const [assigning, setAssigning] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get("/coach/assigned-learners")
      .then(({ data }) => setLearners(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAssign = async () => {
    setShowAssign(true);

    const { data } = await api.get("/users/learners");
    setAllLearners(data);
  };

  const assign = async () => {
    if (!selected) return;

    setAssigning(true);

    try {
      await api.post("/coach/assigned-learners", {
        learner_id: selected,
      });

      setShowAssign(false);
      setSelected("");
      load();
    } finally {
      setAssigning(false);
    }
  };

  const unassignedLearners = allLearners.filter(
    (u) => !learners.some((l) => l.learner_id === u.id),
  );

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
            <Users size={24} className="text-white" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
              Learners
            </h1>

            <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
              {learners.length} learner(s) in your coaching roster
            </p>
          </div>
        </div>

        <Button onClick={openAssign}>
          <UserPlus size={16} />
          Assign Learner
        </Button>
      </div>

      {/* Assign Learner */}

      {showAssign && (
        <Card className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-white">
              Assign Learner
            </h2>

            <button onClick={() => setShowAssign(false)}>
              <X className="text-ink-900/50 hover:text-ink-900 dark:text-white/50 dark:hover:text-white" />
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="input-field flex-1"
            >
              <option value="">Select Learner</option>

              {unassignedLearners.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </select>

            <Button onClick={assign} disabled={!selected || assigning}>
              {assigning && <Loader2 size={15} className="animate-spin" />}
              Assign
            </Button>
          </div>
        </Card>
      )}

      {/* Learners Table */}

      <Card
        padding="sm"
        className="border border-black/10 bg-white shadow-card dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : learners.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No learners assigned"
            description="Assign learners to your coaching roster to begin mentoring them."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-ink-900/50 dark:border-brand-500/20 dark:text-white/50">
                  <th className="py-3 pl-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Sessions</th>
                  <th className="py-3">Avg Score</th>
                  <th className="py-3 pr-3">Last Activity</th>
                </tr>
              </thead>

              <tbody>
                {learners.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-black/5 transition-colors hover:bg-black/[0.03] last:border-0 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="py-3 pl-3 font-semibold text-ink-900 dark:text-white">
                      {l.learner_name}
                    </td>

                    <td className="py-3 text-ink-900/70 dark:text-white/70">
                      {l.learner_email}
                    </td>

                    <td className="py-3 text-ink-900/70 dark:text-white/70">
                      {l.sessions_completed}
                    </td>

                    <td className="py-3 font-data font-bold text-brand-500">
                      {l.average_score ?? "—"}
                    </td>

                    <td className="py-3 pr-3 text-ink-900/50 dark:text-white/50">
                      {l.last_activity_at
                        ? new Date(l.last_activity_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
