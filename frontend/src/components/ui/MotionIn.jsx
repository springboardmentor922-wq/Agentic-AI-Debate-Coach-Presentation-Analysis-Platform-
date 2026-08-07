import { motion } from "framer-motion";

/**
 * Lighter alternative to ContainerScroll for auth/onboarding surfaces —
 * fade + slide-up entrance with blue-purple premium theme support.
 */

export default function MotionIn({
  children,
  delay = 0,
  y = 12,
  className = "",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.2, 0.6, 0.2, 1],
      }}
      className={`
        relative

        before:pointer-events-none
        before:absolute
        before:inset-0
        before:-z-10

        before:rounded-2xl

        before:bg-gradient-to-br
        before:from-blue-500/5
        before:to-violet-500/5

        dark:before:from-blue-500/10
        dark:before:to-purple-500/10

        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
