import { forwardRef } from 'react'

const VARIANT_CLASSES = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary:
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-900/70 dark:text-white/70 transition hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-alert-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-argon transition-all hover:bg-alert-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0',
}

const SIZE_CLASSES = {
  sm: 'text-xs px-3.5 py-2',
  md: '',
}

/**
 * Design-system Button. Wraps the platform's existing `.btn-primary` /
 * `.btn-secondary` utility classes (defined in index.css) so every button
 * added going forward — starting with Module #1 — stays visually consistent
 * and themeable from one place instead of repeating class strings per page.
 */
const Button = forwardRef(function Button(
  { as: Comp = 'button', variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  const classes = [VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary, SIZE_CLASSES[size], className]
    .filter(Boolean)
    .join(' ')
  return (
    <Comp ref={ref} className={classes} {...props}>
      {children}
    </Comp>
  )
})

export default Button
