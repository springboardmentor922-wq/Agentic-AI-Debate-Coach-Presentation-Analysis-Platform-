import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Drawer({ open, onClose, title, subtitle, icon: Icon, children, footer, width = 'max-w-2xl' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 h-full w-full ${width} transform bg-white shadow-2xl transition-transform duration-300 dark:bg-ink-900 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 px-6 py-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
                <Icon size={18} />
              </span>
            )}
            <div>
              <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
              {subtitle && <p className="text-xs text-ink-900/50 dark:text-white/50">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-900/50 transition hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-black/5 px-6 py-4 dark:border-white/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
