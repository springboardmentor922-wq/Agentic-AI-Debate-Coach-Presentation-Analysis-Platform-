import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  onChange,
  totalItems,
  pageSize,
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize;
  const end = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div
      className="
      flex
      flex-col
      gap-3

      rounded-2xl

      border
      border-blue-500/10

      bg-gradient-to-br
      from-blue-50/50
      via-white
      to-purple-50/50

      px-4
      py-3

      shadow-sm

      sm:flex-row
      sm:items-center
      sm:justify-between


      dark:border-white/10

      dark:bg-gradient-to-br
      dark:from-blue-950/40
      dark:via-slate-900/70
      dark:to-purple-950/40
      "
    >
      <p
        className="
        text-xs
        font-medium

        text-ink-900/60
        dark:text-white/60
        "
      >
        Showing{" "}
        <span className="font-semibold text-blue-600 dark:text-blue-300">
          {start}
        </span>
        -
        <span className="font-semibold text-blue-600 dark:text-blue-300">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-purple-600 dark:text-purple-300">
          {totalItems}
        </span>
      </p>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="
          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          border
          border-blue-500/10

          text-ink-900/60

          transition-all

          hover:bg-blue-500/10
          hover:text-blue-600

          disabled:opacity-30

          dark:border-white/10
          dark:text-white/60
          dark:hover:bg-white/10
          dark:hover:text-blue-300
          "
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, i) => (
          <div key={p} className="flex items-center gap-1">
            {i > 0 && pages[i - 1] !== p - 1 && (
              <span
                className="
                  px-1
                  text-sm
                  text-ink-900/40
                  dark:text-white/40
                  "
              >
                ...
              </span>
            )}

            <button
              onClick={() => onChange(p)}
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center

                rounded-lg

                text-sm
                font-semibold

                transition-all

                ${
                  p === page
                    ? `
                      bg-gradient-to-r
                      from-blue-500
                      to-violet-500

                      text-white

                      shadow-lg
                      shadow-blue-500/20

                      scale-105
                    `
                    : `
                      text-ink-900/60

                      hover:bg-blue-500/10
                      hover:text-blue-600

                      dark:text-white/60

                      dark:hover:bg-white/10
                      dark:hover:text-blue-300
                    `
                }
              `}
            >
              {p}
            </button>
          </div>
        ))}

        {/* Next */}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="
          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          border
          border-blue-500/10

          text-ink-900/60

          transition-all

          hover:bg-blue-500/10
          hover:text-blue-600

          disabled:opacity-30

          dark:border-white/10
          dark:text-white/60
          dark:hover:bg-white/10
          dark:hover:text-blue-300
          "
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
