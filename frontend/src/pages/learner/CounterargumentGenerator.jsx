import { useState } from "react";
import { Swords, Loader2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

const SECTIONS = [
  ["counterarguments", "Direct Rebuttals"],
  ["alternative_perspectives", "Alternative Perspectives"],
  ["opponent_questions", "Questions an Opponent May Ask"],
  ["missing_evidence", "Evidence You Should Add"],
  ["weak_claims", "Weak Claims to Reinforce"],
  ["improvement_suggestions", "Improvement Suggestions"],
];

export default function CounterargumentGenerator() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (text.trim().length < 3) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/analysis/counterargument", { text });
      setResult(data);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          "Could not generate counterarguments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl page-fade flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="
          flex h-14 w-14 items-center justify-center rounded-2xl

          bg-gradient-to-br
          from-purple-600
          via-indigo-600
          to-blue-600

          text-white

          shadow-lg
          shadow-purple-500/30
          "
        >
          <Swords size={24} />
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
            Counterargument Generator
          </h1>

          <p className="text-sm text-ink-900/60 dark:text-white/60">
            Paste your argument to get rebuttals, alternative perspectives, and
            likely opponent questions — so you can strengthen it before your
            next debate.
          </p>
        </div>
      </div>

      {/* Input Card */}

      <Card
        className="
        border
        border-purple-500/20

        bg-white

        shadow-lg

        dark:bg-gradient-to-br
        dark:from-purple-900/20
        dark:via-indigo-900/20
        dark:to-blue-900/20
        "
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste the argument you want to stress-test..."
          className="input-field resize-none"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-ink-900/40 dark:text-white/40">
            {text.length} characters
          </span>

          <Button
            onClick={generate}
            disabled={loading || text.trim().length < 3}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Swords size={16} />
            )}
            Generate Counterarguments
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-alert-500">{error}</p>
        )}
      </Card>

      {/* Results */}

      {result && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SECTIONS.map(([key, label]) =>
            result[key]?.length > 0 ? (
              <Card
                key={key}
                className="
                border
                border-purple-500/20

                bg-gradient-to-br
                from-purple-500/5
                via-indigo-500/5
                to-blue-500/10

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
                  {label}
                </p>

                <ul className="flex flex-col gap-2">
                  {result[key].map((item, i) => (
                    <li
                      key={i}
                      className="
                      rounded-xl

                      border
                      border-purple-500/10

                      bg-white/70

                      px-3
                      py-2

                      text-sm

                      text-ink-900/80

                      dark:bg-white/5
                      dark:text-white/80
                      "
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
