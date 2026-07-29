import { Search } from 'lucide-react'

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-900/30 dark:text-white/30" />
      <input
        className="input-field pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function SelectFilter({ value, onChange, options, label }) {
  return (
    <select
      className="input-field w-auto min-w-[140px] cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export default function Toolbar({ children }) {
  return <div className="mb-5 flex flex-wrap items-center gap-3">{children}</div>
}
