import { useEffect, useState } from "react";
import { Gauge, Clock, Eye } from "lucide-react";
import Card from "./Card";
import Badge from "./Badge";
import { SkeletonCard } from "./Skeleton";
import api from "../../api/axios";

const DEBATE_LABELS = {
  argument_quality: "Argument Quality",
  logical_reasoning: "Logical Reasoning",
  evidence_usage: "Evidence Usage",
  rebuttal_quality: "Rebuttal Quality",
  communication_skills: "Communication Skills",
};

const PRESENTATION_LABELS = {
  confidence: "Confidence",
  fluency: "Fluency",
  pronunciation: "Pronunciation",
  grammar: "Grammar",
  speaking_pace: "Speaking Pace",
  persuasiveness: "Persuasiveness",
  clarity: "Clarity",
  engagement: "Engagement",
};

export default function ComprehensiveReport({ sessionId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    setLoading(true);

    api
      .get(`/debate/sessions/${sessionId}/comprehensive-report`)
      .then(({ data }) => setData(data))
      .catch((e) =>
        setError(
          e?.response?.data?.detail ||
            "Could not load the comprehensive report.",
        ),
      )
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <SkeletonCard />;

  if (error) {
    return (
      <div
        className="
        rounded-xl
        border border-red-500/20
        bg-red-500/10
        px-4 py-3
        text-sm
        text-red-600
        dark:text-red-300
      "
      >
        {error}
      </div>
    );
  }

  if (!data) return null;

  const {
    debate_scores,
    presentation_scores,
    time_management,
    body_language,
    overall_performance,
    fallacies_detected_count,
  } = data;

  return (
    <Card>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="
            flex h-10 w-10 items-center justify-center
            rounded-xl
            bg-gradient-to-br
            from-blue-500
            to-violet-500
            text-white
            shadow-lg
            shadow-blue-500/20
          "
          >
            <Gauge size={20} />
          </div>

          <h2
            className="
            font-display
            text-lg
            font-bold
            text-ink-900
            dark:text-white
          "
          >
            Comprehensive Scoring Report
          </h2>
        </div>

        {overall_performance != null && (
          <div
            className="
            rounded-xl
            bg-gradient-to-r
            from-blue-500
            to-violet-500
            px-4 py-2
            text-white
            shadow-lg
            shadow-blue-500/20
          "
          >
            <p className="font-data text-xl font-bold">
              {overall_performance}/100
            </p>
          </div>
        )}
      </div>

      {!data.has_debate_analysis && !data.has_presentation_analysis && (
        <p
          className="
          rounded-xl
          border
          border-blue-500/10
          bg-blue-500/5
          p-4
          text-sm
          text-ink-900/50
          dark:text-white/50
        "
        >
          No analysis has been generated for this session yet.
        </p>
      )}

      {debate_scores && (
        <div className="mb-5">
          <p
            className="
            mb-3
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-blue-600
            dark:text-blue-300
          "
          >
            Debate Scores (0-10)
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Object.entries(DEBATE_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="
                  rounded-xl
                  border
                  border-blue-500/10

                  bg-gradient-to-br
                  from-blue-50
                  to-purple-50

                  px-3 py-3
                  text-center

                  dark:border-white/10
                  dark:from-blue-950/40
                  dark:to-purple-950/40
                "
              >
                <p
                  className="
                  font-data
                  text-lg
                  font-bold
                  text-blue-600
                  dark:text-blue-300
                "
                >
                  {debate_scores[key] ?? "—"}
                </p>

                <p
                  className="
                  mt-1
                  text-[10px]
                  uppercase
                  tracking-wide
                  text-ink-900/40
                  dark:text-white/40
                "
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {fallacies_detected_count > 0 && (
            <p
              className="
              mt-3
              rounded-lg
              bg-red-500/10
              px-3 py-2
              text-xs
              text-red-500
            "
            >
              {fallacies_detected_count} logical fallacy(ies) detected across
              this session.
            </p>
          )}
        </div>
      )}

      {presentation_scores && (
        <div className="mb-5">
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
            Presentation Scores (0-100)
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(PRESENTATION_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="
                rounded-xl
                border
                border-purple-500/10

                bg-gradient-to-br
                from-purple-50
                to-blue-50

                px-3 py-3
                text-center

                dark:border-white/10
                dark:from-purple-950/40
                dark:to-blue-950/40
                "
              >
                <p
                  className="
                  font-data
                  text-lg
                  font-bold
                  text-purple-600
                  dark:text-purple-300
                "
                >
                  {presentation_scores[key] ?? "—"}
                </p>

                <p
                  className="
                  mt-1
                  text-[10px]
                  uppercase
                  tracking-wide
                  text-ink-900/40
                  dark:text-white/40
                "
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className="
          flex items-center gap-3
          rounded-xl
          border
          border-blue-500/10

          bg-blue-500/5

          px-4 py-3

          dark:border-white/10
        "
        >
          <Clock size={16} className="text-blue-500" />

          <div>
            <p className="text-xs font-semibold text-ink-900 dark:text-white">
              Time Management
            </p>

            <p className="text-xs text-ink-900/50 dark:text-white/50">
              {time_management
                ? `${Math.round(time_management.duration_seconds / 60)} min ${Math.round(time_management.duration_seconds % 60)}s`
                : "Not available until the session is completed"}
            </p>
          </div>
        </div>

        <div
          className="
          flex items-center gap-3
          rounded-xl
          border
          border-purple-500/10

          bg-purple-500/5

          px-4 py-3

          dark:border-white/10
        "
        >
          <Eye size={16} className="text-purple-500" />

          <div>
            <p
              className="
              flex items-center gap-2
              text-xs
              font-semibold
              text-ink-900
              dark:text-white
            "
            >
              Body Language
              <Badge tone="neutral">Not Available</Badge>
            </p>

            <p className="text-xs text-ink-900/50 dark:text-white/50">
              {body_language.note}
            </p>
          </div>
        </div>
      </div>

      {debate_scores?.final_summary && (
        <div
          className="
          mt-5
          rounded-xl

          border
          border-blue-500/20

          bg-gradient-to-r
          from-blue-500/10
          to-purple-500/10

          px-4 py-3

          text-sm

          text-ink-900
          dark:text-white
        "
        >
          {debate_scores.final_summary}
        </div>
      )}
    </Card>
  );
}
