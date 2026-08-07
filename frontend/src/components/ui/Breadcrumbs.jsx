import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav
      className="
        mb-2
        flex
        items-center
        gap-1.5

        rounded-lg
        border
        border-brand-500/10

        bg-gradient-to-r
        from-brand-500/5
        via-purple-500/5
        to-accent-500/5

        px-3
        py-1.5

        text-xs
        text-ink-900/50

        dark:border-white/10
        dark:text-white/50
      "
      aria-label="Breadcrumb"
    >
      <Link
        to="/learner"
        className="
          flex
          items-center

          rounded-md
          p-1

          text-brand-500

          transition-all
          duration-300

          hover:bg-brand-500/10
          hover:text-purple-500

          dark:text-brand-300
          dark:hover:bg-white/10
        "
      >
        <Home size={13} />
      </Link>

      {items.map((item, i) => (
        <span
          key={i}
          className="
            flex
            items-center
            gap-1.5
          "
        >
          <ChevronRight
            size={12}
            className="
              text-brand-500/60
              dark:text-brand-300/60
            "
          />

          {item.to ? (
            <Link
              to={item.to}
              className="
                rounded-md
                px-1

                transition-all
                duration-300

                hover:bg-brand-500/10
                hover:text-brand-600

                dark:hover:text-brand-300
              "
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="
                rounded-md
                bg-gradient-to-r
                from-brand-600
                to-purple-600

                bg-clip-text
                px-1

                font-semibold
                text-transparent
              "
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
