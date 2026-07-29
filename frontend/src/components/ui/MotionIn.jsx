import { motion } from 'framer-motion'

/**
 * Lighter alternative to ContainerScroll for auth/onboarding surfaces —
 * a simple fade + slide-up entrance with optional stagger delay. Kept out
 * of the dashboards (which use the CSS-only `.page-fade` utility instead)
 * per the decision to prioritize dashboard performance over motion.
 */
export default function MotionIn({ children, delay = 0, y = 12, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.2, 0.6, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
