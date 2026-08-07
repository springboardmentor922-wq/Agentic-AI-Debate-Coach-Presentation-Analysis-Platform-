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

export default function CoachSkillGap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [roster, setRoster] = useState([]);
  const [learnerId, setLearnerId] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    api
      .get("/coach/assigned-learners")
      .then(({ data }) => setRoster(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);

    const params = {};

    if (learnerId) params.learner_id = learnerId;

    if (department) params.department = department;

    api
      .get("/coach/skill-gap", { params })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [learnerId, department]);

  const dims = Object.entries(data?.averages || {});

  const departments = [
    ...new Set(roster.map((l) => l.department).filter(Boolean)),
  ];

  return (
    <div className="page-fade flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <div
          className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl

          bg-gradient-to-br
          from-purple-600
          via-indigo-600
          to-blue-600

          text-white

          shadow-lg
          shadow-purple-500/30
          "
        >
          <Target size={26} />
        </div>

        <div>
          <h1
            className="
            font-display
            text-3xl
            font-bold

            text-ink-900
            dark:text-white
            "
          >
            Skill Gap Analysis
          </h1>

          <p
            className="
            text-sm

            text-ink-900/60
            dark:text-white/60
            "
          >
            Real scores across your roster — filter by learner or department,
            see trends over time.
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
          className="
          rounded-xl

          border
          border-purple-500/20

          bg-white

          px-4
          py-2

          text-sm

          text-ink-900

          shadow-sm

          dark:bg-white/5

          dark:text-white
          "
        >
          <option value="">All learners</option>

          {roster.map((l) => (
            <option key={l.learner_id} value={l.learner_id}>
              {l.learner_name}
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
            className="
            rounded-xl

            border
            border-purple-500/20

            bg-white

            px-4
            py-2

            text-sm

            text-ink-900

            dark:bg-white/5

            dark:text-white
            "
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
        <Card
          className="
          border
          border-purple-500/20

          bg-gradient-to-br

          dark:from-purple-900/20
          dark:via-indigo-900/20
          dark:to-blue-900/20
          "
        >
          <p
            className="
          py-8
          text-center
          text-sm
          text-ink-900/40
          dark:text-white/40
          "
          >
            No scored debates match this filter yet — skill gap data will appear
            once matching learners complete debates.
          </p>
        </Card>
      ) : (
        <>
          {/* Current Average */}

          <Card
            className="
            border
            border-purple-500/20

            bg-gradient-to-br

            dark:from-purple-900/20
            dark:via-indigo-900/20
            dark:to-blue-900/20
            "
          >
            <p
              className="
            mb-4
            text-xs
            font-semibold
            uppercase
            tracking-wider

            text-purple-600

            dark:text-purple-300
            "
            >
              Current Averages ({data.sample_size} reports across{" "}
              {data.learner_count} learners)
            </p>

            <div className="flex flex-col gap-5">
              {dims.map(([key, value]) => (
                <div key={key}>
                  <div
                    className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  text-sm
                  "
                  >
                    <span
                      className="
                    font-medium
                    text-ink-900
                    dark:text-white
                    "
                    >
                      {LABELS[key] || key}
                    </span>

                    <span
                      className="
                    font-data
                    font-bold

                    text-purple-600

                    dark:text-purple-400
                    "
                    >
                      {value}%
                    </span>
                  </div>

                  <ProgressBar value={value} size="sm" showValue={false} />
                </div>
              ))}
            </div>
          </Card>

          {data.trend?.length > 1 && (
            <Card
              className="
              border
              border-purple-500/20

              bg-gradient-to-br

              dark:from-purple-900/20
              dark:via-indigo-900/20
              dark:to-blue-900/20
              "
            >
              <p
                className="
              mb-3
              text-xs
              font-semibold
              uppercase
              tracking-wider

              text-purple-600

              dark:text-purple-300
              "
              >
                Historical Trend
              </p>

              <LineChart data={data.trend} color="#8B5CF6" height={160} />
            </Card>
          )}

          <div
            className="
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          "
          >
            <Card
              className="
              border
              border-purple-500/20
              "
            >
              <p
                className="
              mb-3
              text-xs
              font-semibold
              uppercase

              text-blue-500
              "
              >
                Strengths
              </p>

              {data.strengths.map((s, i) => (
                <div
                  key={i}
                  className="
                  flex
                  justify-between
                  py-2
                  text-sm
                  "
                >
                  <span
                    className="
                  text-ink-900
                  dark:text-white
                  "
                  >
                    {s.dimension}
                  </span>

                  <span
                    className="
                  font-bold
                  text-blue-500
                  "
                  >
                    {s.score}%
                  </span>
                </div>
              ))}
            </Card>

            <Card
              className="
              border
              border-purple-500/20
              "
            >
              <p
                className="
              mb-3
              text-xs
              font-semibold
              uppercase

              text-purple-500
              "
              >
                Weaknesses
              </p>

              {data.weaknesses.map((s, i) => (
                <div
                  key={i}
                  className="
                  flex
                  justify-between
                  py-2
                  text-sm
                  "
                >
                  <span
                    className="
                  text-ink-900
                  dark:text-white
                  "
                  >
                    {s.dimension}
                  </span>

                  <span
                    className="
                  font-bold
                  text-purple-500
                  "
                  >
                    {s.score}%
                  </span>
                </div>
              ))}
            </Card>
          </div>

          {data.recommendations?.length > 0 && (
            <Card
              className="
              border
              border-purple-500/20
              "
            >
              <p
                className="
              mb-3
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              uppercase

              text-purple-500
              "
              >
                <Lightbulb size={14} />
                Recommendations
              </p>

              <div className="flex flex-col gap-3">
                {data.recommendations.map((r, i) => (
                  <div
                    key={i}
                    className="
                    rounded-xl

                    bg-purple-500/5

                    px-4
                    py-3

                    border
                    border-purple-500/10
                    "
                  >
                    <p
                      className="
                    text-sm
                    font-semibold

                    text-ink-900

                    dark:text-white
                    "
                    >
                      {r.title}
                    </p>

                    <p
                      className="
                    text-xs

                    text-ink-900/50

                    dark:text-white/50
                    "
                    >
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
