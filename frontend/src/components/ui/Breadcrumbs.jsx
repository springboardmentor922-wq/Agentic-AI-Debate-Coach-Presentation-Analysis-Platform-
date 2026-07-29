import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="mb-1 flex items-center gap-1.5 text-xs text-ink-900/50 dark:text-white/50" aria-label="Breadcrumb">
      <Link to="/learner" className="flex items-center hover:text-brand-600 dark:hover:text-brand-300">
        <Home size={13} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={12} />
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-600 dark:hover:text-brand-300">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-900 dark:text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
