import { useEffect, useState } from "react";
import { Users, GraduationCap, Award, BookOpen } from "lucide-react";
import api from "../api/axios";

const CARDS = [
  { key: "total_users", label: "Total Users", icon: Users, tone: "cool" },
  {
    key: "total_learners",
    label: "Total Learners",
    icon: GraduationCap,
    tone: "warm",
  },
  {
    key: "total_debate_coaches",
    label: "Total Debate Coaches",
    icon: Award,
    tone: "verdict",
  },
  {
    key: "total_educators",
    label: "Total Educators",
    icon: BookOpen,
    tone: "cool",
  },
];

const ICON_TONE = {
  cool: `
    text-blue-500
    dark:text-blue-300
  `,
  warm: `
    text-indigo-500
    dark:text-indigo-300
  `,
  verdict: `
    text-violet-500
    dark:text-violet-300
  `,
};

const CARD_GLOW = {
  cool: `
    from-blue-500/10
    to-blue-500/5
    border-blue-500/20
  `,
  warm: `
    from-indigo-500/10
    to-indigo-500/5
    border-indigo-500/20
  `,
  verdict: `
    from-violet-500/10
    to-violet-500/5
    border-violet-500/20
  `,
};

export default function PlatformStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/users/stats/platform")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, tone }) => (
        <div
          key={key}
          className={`
            group
            rounded-2xl
            border
            bg-gradient-to-br
            p-5
            transition-all
            duration-300

            hover:-translate-y-1
            hover:shadow-[0_0_25px_rgba(99,102,241,0.18)]

            dark:bg-white/[0.03]

            ${CARD_GLOW[tone]}
          `}
        >
          <div className="flex items-center justify-between">
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-ink-900/50

                dark:text-white/50
              "
            >
              {label}
            </span>

            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-white/60

                dark:bg-white/10
              "
            >
              <Icon size={16} className={ICON_TONE[tone]} />
            </div>
          </div>

          <span
            className="
              mt-4
              block
              font-data
              text-2xl
              font-bold
              text-ink-900
              tabular-nums

              dark:text-white
            "
          >
            {stats ? stats[key] : "—"}
          </span>

          <div
            className="
              mt-3
              h-1
              w-full
              overflow-hidden
              rounded-full
              bg-black/5

              dark:bg-white/10
            "
          >
            <div
              className={`
                h-full
                w-2/3
                rounded-full
                bg-gradient-to-r
                from-blue-500
                via-indigo-500
                to-violet-500
                opacity-70
              `}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
