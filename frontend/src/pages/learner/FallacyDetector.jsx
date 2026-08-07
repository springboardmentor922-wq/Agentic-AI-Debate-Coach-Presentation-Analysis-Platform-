import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import api from "../../api/axios";

const SEVERITY_TONE = {
  low: "warning",
  medium: "warning",
  high: "danger",
};

export default function FallacyDetector() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const check = async () => {
    if (text.trim().length < 3) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/analysis/fallacy", {
        text,
      });

      setResult(data);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          "Could not check this text. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl page-fade">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div
          className="
            flex h-12 w-12
            items-center justify-center
            rounded-2xl
            bg-gradient-to-br
            from-brand-500
            to-accent-500
            text-white
            shadow-premium
          "
        >
          <AlertTriangle size={24} />
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
            Fallacy Detector
          </h1>

          <p
            className="
              text-sm
              text-ink-900/60
              dark:text-white/60
            "
          >
            Detect logical mistakes in arguments and improve your reasoning
            quality.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card
        className="
          border
          border-brand-500/10
          bg-gradient-to-br
          from-brand-500/5
          via-purple-500/5
          to-transparent
        "
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste the argument you want checked for logical fallacies..."
          className="
            input-field
            resize-none
            bg-white/70
            dark:bg-white/5
          "
        />

        <div className="mt-4 flex items-center justify-between">
          <span
            className="
              text-xs
              text-ink-900/40
              dark:text-white/40
            "
          >
            {text.length} characters
          </span>

          <Button onClick={check} disabled={loading || text.trim().length < 3}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <AlertTriangle size={16} />
            )}

            {loading ? "Analyzing..." : "Check for Fallacies"}
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-alert-500">{error}</p>
        )}
      </Card>

      {/* Result */}
      {result && (
        <Card
          className="
            mt-6
            border
            border-brand-500/10
            bg-gradient-to-br
            from-brand-500/5
            via-purple-500/5
            to-transparent
          "
        >
          {result.fallacy_detected ? (
            <div className="flex flex-col gap-5">
              {/* Fallacy Header */}
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-alert-500/10
                    text-alert-500
                  "
                >
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <p
                    className="
                      font-display
                      text-xl
                      font-bold
                      text-ink-900
                      dark:text-white
                    "
                  >
                    {result.fallacy_type}
                  </p>

                  {result.severity && (
                    <Badge tone={SEVERITY_TONE[result.severity] || "warning"}>
                      {result.severity} severity
                    </Badge>
                  )}
                </div>
              </div>

              {result.offending_text && (
                <div
                  className="
                    rounded-xl
                    border-l-4
                    border-alert-500
                    bg-alert-500/5
                    px-4
                    py-3
                    text-sm
                    italic
                    text-ink-900/80
                    dark:text-white/80
                  "
                >
                  "{result.offending_text}"
                </div>
              )}

              {result.explanation && (
                <div
                  className="
                    rounded-xl
                    border
                    border-black/5
                    p-4
                    dark:border-white/10
                  "
                >
                  <p
                    className="
                      mb-2
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-brand-600
                    "
                  >
                    Why this is a fallacy
                  </p>

                  <p
                    className="
                      text-sm
                      text-ink-900/80
                      dark:text-white/80
                    "
                  >
                    {result.explanation}
                  </p>
                </div>
              )}

              {result.correction_suggestion && (
                <div
                  className="
                    rounded-xl
                    border
                    border-brand-500/20
                    bg-brand-500/5
                    p-4
                  "
                >
                  <p
                    className="
                      mb-2
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-brand-600
                    "
                  >
                    How to fix it
                  </p>

                  <p
                    className="
                      text-sm
                      text-ink-900/80
                      dark:text-white/80
                    "
                  >
                    {result.correction_suggestion}
                  </p>
                </div>
              )}

              {result.better_version && (
                <div
                  className="
                    rounded-xl
                    bg-gradient-to-r
                    from-verdict-500/10
                    to-brand-500/10
                    p-4
                  "
                >
                  <p
                    className="
                      mb-2
                      flex
                      items-center
                      gap-1
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-verdict-600
                    "
                  >
                    <Sparkles size={13} />
                    Suggested Rewrite
                  </p>

                  <p
                    className="
                      text-sm
                      text-ink-900
                      dark:text-white
                    "
                  >
                    {result.better_version}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                bg-verdict-500/10
                p-4
                text-verdict-600
              "
            >
              <CheckCircle2 size={24} />

              <p className="font-semibold">
                No logical fallacy detected — your reasoning holds up.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
