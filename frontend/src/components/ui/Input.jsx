import { forwardRef } from 'react'

/**
 * Design-system Input: label + `.input-field` + inline error message.
 * Forwards ref so it drops into react-hook-form / uncontrolled patterns.
 */
const Input = forwardRef(function Input({ label, error, hint, id, className = '', ...props }, ref) {
  const inputId = id || props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-ink-900/70 dark:text-white/70">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          'input-field',
          error ? 'border-alert-500 focus:border-alert-500 focus:ring-alert-500/30' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error ? (
        <span className="text-xs font-medium text-alert-500">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-900/40 dark:text-white/40">{hint}</span>
      ) : null}
    </div>
  )
})

export default Input
