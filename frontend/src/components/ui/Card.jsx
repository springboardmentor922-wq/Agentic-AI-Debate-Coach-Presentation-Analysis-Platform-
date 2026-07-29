const PADDING = { sm: 'p-4', md: 'p-6', lg: 'p-8' }

/**
 * Design-system Card. Wraps `.glass-card` (or a flat `solid` variant for
 * dense table/list contexts where blur/translucency hurts legibility).
 */
export default function Card({ variant = 'glass', padding = 'md', className = '', children, ...props }) {
  const base =
    variant === 'glass'
      ? 'glass-card'
      : 'rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-ink-900'
  return (
    <div className={[base, PADDING[padding], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}
