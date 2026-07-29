import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-black/5 pt-4 dark:border-white/10 sm:flex-row">
      <p className="text-xs text-ink-900/50 dark:text-white/50">
        Showing <span className="font-semibold text-ink-900 dark:text-white">{start}-{end}</span> of{' '}
        <span className="font-semibold text-ink-900 dark:text-white">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg p-2 text-ink-900/60 transition hover:bg-black/5 disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/10"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-ink-900/30 dark:text-white/30">…</span>}
            <button
              onClick={() => onChange(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                p === page
                  ? 'bg-brand-500 text-white shadow-premium'
                  : 'text-ink-900/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          </span>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-lg p-2 text-ink-900/60 transition hover:bg-black/5 disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/10"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
