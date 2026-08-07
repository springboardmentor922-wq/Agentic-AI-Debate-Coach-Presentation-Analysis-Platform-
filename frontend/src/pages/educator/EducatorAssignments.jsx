import { useEffect, useState } from "react";
import { ClipboardList, Plus, X, Loader2 } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function EducatorAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    learner_id: "",
    topic: "",
    debate_format: "one_on_one",
    note: "",
  });

  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get("/educator/assignments")
      .then(({ data }) => setAssignments(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get("/educator/learners").then(({ data }) => setLearners(data));
  }, []);

  const create = async () => {
    if (!form.learner_id || !form.topic.trim()) return;

    setSaving(true);

    try {
      await api.post("/educator/assign-topic", form);

      setForm({
        learner_id: "",
        topic: "",
        debate_format: "one_on_one",
        note: "",
      });

      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
            <ClipboardList size={24} className="text-white" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Assignments
            </h1>

            <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
              {assignments.length} assignment(s)
            </p>
          </div>
        </div>

        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} />
          New Assignment
        </Button>
      </div>

      {/* Create Form */}

      {showForm && (
        <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Assign a Debate Topic
            </p>

            <button onClick={() => setShowForm(false)} aria-label="Close form">
              <X size={18} className="text-gray-500 dark:text-white/60" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Learner
              </label>

              <select
                value={form.learner_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    learner_id: e.target.value,
                  }))
                }
                className="input-field"
              >
                <option value="">Select a learner...</option>

                {learners.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.full_name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Topic"
              value={form.topic}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  topic: e.target.value,
                }))
              }
              placeholder="Should social media be regulated?"
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Debate Format
              </label>

              <select
                value={form.debate_format}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    debate_format: e.target.value,
                  }))
                }
                className="input-field"
              >
                <option value="one_on_one">One-on-One</option>
                <option value="parliamentary">Parliamentary</option>
                <option value="oxford">Oxford</option>
                <option value="policy">Policy</option>
                <option value="public_forum">Public Forum</option>
              </select>
            </div>

            <Input
              label="Note (optional)"
              value={form.note}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  note: e.target.value,
                }))
              }
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={create}
              disabled={saving || !form.learner_id || !form.topic.trim()}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Assign
            </Button>
          </div>
        </Card>
      )}

      {/* Assignment List */}

      <Card
        padding="sm"
        className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assignments yet"
            description="Assign a debate topic to a learner to get started."
          />
        ) : (
          <div className="flex flex-col divide-y divide-gray-200 dark:divide-brand-500/10">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {a.learner_name}
                  </p>

                  <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
                    {a.topic} • {a.debate_format.replace("_", " ")}
                  </p>
                </div>

                <Badge tone={a.completed ? "success" : "warning"}>
                  {a.completed ? "Completed" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
