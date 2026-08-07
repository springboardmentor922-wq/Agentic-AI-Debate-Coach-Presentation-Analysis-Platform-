import { useEffect, useState } from "react";
import { Target, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import { SkeletonCard } from "../../components/ui/Skeleton";
import LineChart from "../../components/charts/LineChart";
import api from "../../api/axios";

const LABELS = {
  argument_quality: "Argument Quality",
  evidence_usage: "Evidence Usage",
  logical_consistency: "Logical Consistency",
  rebuttal_effectiveness: "Rebuttal Effectiveness",
  communication_skills: "Communication Skills",
};

export default function EducatorSkillGap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [learners, setLearners] = useState([]);
  const [learnerId, setLearnerId] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    api
      .get("/educator/learners")
      .then(({ data }) => setLearners(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (learnerId) params.learner_id = learnerId;
    if (department) params.department = department;

    api
      .get("/educator/skill-gap", { params })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [learnerId, department]);

  const dims = Object.entries(data?.averages || {});
  const departments = [
    ...new Set(learners.map((l) => l.department).filter(Boolean)),
  ];

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-button-gradient shadow-premium">
          <Target size={24} className="text-white" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Skill Gap Analysis
          </h1>

          <p className="mt-1 text-sm text-ink-900/60 dark:text-white/60">
            Real scores platform-wide — filter by learner or department, see
            trends over time.
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="flex flex-wrap gap-3">
        <select
          value={learnerId}
          onChange={(e) => {
            setLearnerId(e.target.value);
            setDepartment("");
          }}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm dark:border-white/10 dark:bg-ink-800 dark:text-white"
        >
          <option value="">All learners</option>

          {learners.map((l) => (
            <option key={l.id} value={l.id}>
              {l.full_name}
            </option>
          ))}
        </select>

        {departments.length > 0 && (
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setLearnerId("");
            }}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm dark:border-white/10 dark:bg-ink-800 dark:text-white"
          >
            <option value="">All departments</option>

            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <SkeletonCard />
      ) : dims.length === 0 ? (
        <Card className="bg-white shadow-card dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
          <p className="py-8 text-center text-sm text-ink-900/40 dark:text-white/40">
            No scored debates match this filter yet — skill gap data will appear
            once matching learners complete debates.
          </p>
        </Card>
      ) : (
        <>
          {/* Current Averages */}

          <Card className="bg-white shadow-card dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-white/40">
              Current Averages ({data.sample_size} report
              {data.sample_size !== 1 ? "s" : ""} across {data.learner_count}
              learner{data.learner_count !== 1 ? "s" : ""})
            </p>

            <div className="flex flex-col gap-4">
              {dims.map(([key, value]) => (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-900 dark:text-white">
                      {LABELS[key] || key}
                    </span>

                    <div className="flex items-center gap-2">
                      {data.improvement_percent?.[key] !== undefined &&
                        data.improvement_percent[key] !== 0 && (
                          <Badge
                            tone={
                              data.improvement_percent[key] > 0
                                ? "success"
                                : "danger"
                            }
                          >
                            {data.improvement_percent[key] > 0 ? (
                              <TrendingUp size={11} />
                            ) : (
                              <TrendingDown size={11} />
                            )}
                            {Math.abs(data.improvement_percent[key])}%
                          </Badge>
                        )}

                      <span className="font-data font-bold text-brand-500">
                        {value}%
                      </span>
                    </div>
                  </div>

                  <ProgressBar value={value} size="sm" showValue={false} />
                </div>
              ))}
            </div>
          </Card>

          {/* Trend */}

          {data.trend?.length > 1 && (
            <Card className="bg-white shadow-card dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-white/40">
                Historical Trend (overall average)
              </p>

              <LineChart data={data.trend} color="#3FA9F5" height={160} />
            </Card>
          )}

          {/* Strengths & Weaknesses */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="bg-white shadow-card dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-verdict-600">
                Strengths
              </p>

              <div className="flex flex-col gap-2">
                {data.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink-900 dark:text-white">
                      {s.dimension}
                    </span>

                    <span className="font-data font-bold text-verdict-500">
                      {s.score}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white shadow-card dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-alert-500">
                Weaknesses
              </p>

              <div className="flex flex-col gap-2">
                {data.weaknesses.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink-900 dark:text-white">
                      {s.dimension}
                    </span>

                    <span className="font-data font-bold text-alert-500">
                      {s.score}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations */}

          {data.recommendations?.length > 0 && (
            <Card className="bg-white shadow-card dark:bg-gradient-to-br dark:from-brand-900/10 dark:to-accent-900/10">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-white/40">
                <Lightbulb size={13} />
                Recommendations
              </p>

              <div className="flex flex-col gap-3">
                {data.recommendations.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-brand-50 px-3 py-3 dark:bg-white/5"
                  >
                    <p className="text-sm font-medium text-ink-900 dark:text-white">
                      {r.title}
                    </p>

                    <p className="text-xs text-ink-900/60 dark:text-white/50">
                      {r.detail}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
