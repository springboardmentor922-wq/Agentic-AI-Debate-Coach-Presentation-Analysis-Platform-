import { useEffect, useState } from "react";
import { ClipboardCheck, Plus, Trash2, X, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api from "../../api/axios";

export default function EducatorRubrics() {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [criteriaText, setCriteriaText] = useState("");
  const [format, setFormat] = useState("one_on_one");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/educator/rubrics")
      .then(({ data }) => setRubrics(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const create = async () => {
    if (!title.trim()) return;

    setSaving(true);

    try {
      await api.post("/educator/rubrics", {
        title,
        criteria: criteriaText
          .split("\n")
          .map((c) => c.trim())
          .filter(Boolean),
        debate_format: format,
      });

      setTitle("");
      setCriteriaText("");
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`/educator/rubrics/${id}`);
    setRubrics((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
            <ClipboardCheck size={24} className="text-white" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Rubrics & Criteria
            </h1>

            <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
              Real, persisted grading rubrics you create and reuse.
            </p>
          </div>
        </div>

        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} /> New Rubric
        </Button>
      </div>

      {showForm && (
        <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              New Rubric
            </p>

            <button onClick={() => setShowForm(false)} aria-label="Close form">
              <X
                size={18}
                className="text-gray-500 transition hover:text-gray-700 dark:text-white/50 dark:hover:text-white"
              />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Oxford Debate Rubric"
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Criteria (one per line)
              </label>

              <textarea
                rows={4}
                value={criteriaText}
                onChange={(e) => setCriteriaText(e.target.value)}
                className="input-field resize-none"
                placeholder={
                  "Clarity of argument\nUse of evidence\nRebuttal strength"
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Debate Format
              </label>

              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="input-field"
              >
                <option value="one_on_one">One-on-One</option>
                <option value="parliamentary">Parliamentary</option>
                <option value="oxford">Oxford</option>
                <option value="policy">Policy</option>
                <option value="public_forum">Public Forum</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={create} disabled={saving || !title.trim()}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save Rubric
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <SkeletonCard />
      ) : rubrics.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No rubrics yet"
          description="Create a rubric to standardize how you grade debates."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {rubrics.map((r) => (
            <Card
              key={r.id}
              className="border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:shadow-premium dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {r.title}
                </p>

                <button
                  onClick={() => remove(r.id)}
                  aria-label={`Delete rubric ${r.title}`}
                  className="text-red-500 transition hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="mb-4 text-xs uppercase tracking-wider text-brand-600 dark:text-brand-300">
                {r.debate_format.replace("_", " ")}
              </p>

              <ul className="space-y-2">
                {r.criteria.map((c, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 dark:text-white/70"
                  >
                    • {c}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
