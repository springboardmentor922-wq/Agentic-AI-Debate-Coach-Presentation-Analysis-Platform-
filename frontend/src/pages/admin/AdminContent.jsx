import { useEffect, useState } from "react";
import { FolderKanban, Plus, Trash2, X, Loader2 } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const EMPTY_FORM = {
  title: "",
  category: "",
  difficulty: "beginner",
  debate_format: "one_on_one",
  popularity: 50,
};

const DIFFICULTY_TONE = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

export default function AdminContent() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get("/admin/content/topics")
      .then(({ data }) => setTopics(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const create = async () => {
    if (!form.title.trim() || !form.category.trim()) return;

    setSaving(true);

    try {
      await api.post("/admin/content/topics", form);

      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`/admin/content/topics/${id}`);

    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 shadow-premium">
            <FolderKanban size={24} className="text-white" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Content Management
            </h1>

            <p className="text-sm text-gray-600 dark:text-white/60">
              Manage the debate topics learners see in Practice Topics & AI
              Debate Simulation.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowForm(true)}
          size="sm"
          className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium transition-all hover:scale-105"
        >
          <Plus size={16} />
          New Topic
        </Button>
      </div>

      {/* Create Form */}

      {showForm && (
        <Card className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              New Debate Topic
            </p>

            <button onClick={() => setShowForm(false)}>
              <X
                size={18}
                className="text-gray-500 transition hover:text-gray-700 dark:text-white/50 dark:hover:text-brand-300"
              />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              value={form.title}
              placeholder="Should social media be regulated?"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                }))
              }
            />

            <Input
              label="Category"
              value={form.category}
              placeholder="Technology"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value,
                }))
              }
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                Difficulty
              </label>

              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    difficulty: e.target.value,
                  }))
                }
                className="input-field"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
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
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={create}
              disabled={saving || !form.title.trim() || !form.category.trim()}
              className="bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-premium transition-all hover:scale-105"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Create Topic
            </Button>
          </div>
        </Card>
      )}

      {/* Table */}

      <Card
        padding="sm"
        className="border border-gray-200 bg-white dark:border-brand-500/20 dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10"
      >
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : topics.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No topics yet"
            description="Add debate topics for learners to practice with."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-brand-600 dark:border-brand-500/20 dark:text-brand-300">
                  <th className="py-3 pl-2">Title</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Difficulty</th>
                  <th className="py-3">Format</th>
                  <th className="py-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {topics.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-200 transition-all hover:bg-gray-50 last:border-0 dark:border-brand-500/10 dark:hover:bg-brand-500/5"
                  >
                    <td className="py-3 pl-2 font-medium text-gray-900 dark:text-white">
                      {t.title}
                    </td>

                    <td className="py-3 text-gray-600 dark:text-white/70">
                      {t.category}
                    </td>

                    <td className="py-3">
                      <Badge tone={DIFFICULTY_TONE[t.difficulty] || "neutral"}>
                        {t.difficulty}
                      </Badge>
                    </td>

                    <td className="py-3 capitalize text-gray-600 dark:text-white/70">
                      {t.debate_format.replace("_", " ")}
                    </td>

                    <td className="py-3 pr-2 text-right">
                      <button
                        onClick={() => remove(t.id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-100 hover:text-red-600 dark:text-alert-400 dark:hover:bg-alert-500/10 dark:hover:text-alert-300"
                      >
                        <Trash2 size={16} />
                      </button>
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
