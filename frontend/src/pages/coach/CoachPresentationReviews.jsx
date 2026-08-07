import { useEffect, useState } from "react";
import { Presentation } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import api, { mediaAudioUrl } from "../../api/axios";

export default function CoachPresentationReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/coach/presentation-reviews")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

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
          <Presentation size={26} />
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
            Presentation Reviews
          </h1>

          <p
            className="
            mt-1
            text-sm

            text-ink-900/60
            dark:text-white/60
            "
          >
            Real presentation analyses from your roster.
          </p>
        </div>
      </div>

      {/* Content Card */}

      <Card
        padding="sm"
        className="
        border

        border-purple-500/20

        bg-white

        shadow-xl

        dark:bg-gradient-to-br
        dark:from-purple-900/20
        dark:via-indigo-900/20
        dark:to-blue-900/20

        dark:backdrop-blur-xl
        "
      >
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Presentation}
            title="No presentations analyzed yet"
            description="Presentation recordings from your roster will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="
                  border-b

                  border-purple-500/20

                  text-xs
                  uppercase
                  tracking-wide

                  text-purple-600

                  dark:text-purple-300
                  "
                >
                  <th className="py-3 pl-3">Topic</th>

                  <th className="py-3">Overall Score</th>

                  <th className="py-3">Recording</th>

                  <th className="py-3 pr-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="
                    border-b

                    border-black/5

                    transition-all
                    duration-300

                    hover:bg-purple-500/5

                    dark:border-purple-500/10

                    dark:hover:bg-purple-500/10

                    last:border-0
                    "
                  >
                    <td
                      className="
                      py-3
                      pl-3

                      font-medium

                      text-ink-900

                      dark:text-white
                      "
                    >
                      {p.topic || "—"}
                    </td>

                    <td
                      className="
                      py-3

                      font-data
                      font-bold

                      text-purple-600

                      dark:text-purple-400
                      "
                    >
                      {p.presentation_score?.overall_score ?? "—"}/100
                    </td>

                    <td className="py-3">
                      {p.audio_filename ? (
                        <audio
                          controls
                          src={mediaAudioUrl(p.id)}
                          className="
                          h-9
                          max-w-[220px]

                          rounded-lg

                          "
                        />
                      ) : (
                        <span
                          className="
                          text-xs

                          text-ink-900/40

                          dark:text-white/40
                          "
                        >
                          No audio retained
                        </span>
                      )}
                    </td>

                    <td
                      className="
                      py-3
                      pr-3

                      text-ink-900/50

                      dark:text-white/50
                      "
                    >
                      {new Date(p.created_at).toLocaleDateString()}
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
