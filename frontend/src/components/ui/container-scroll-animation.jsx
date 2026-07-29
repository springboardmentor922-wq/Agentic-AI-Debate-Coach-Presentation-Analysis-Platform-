import React, { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'

/**
 * Adapted from the 21st.dev / Aceternity `ContainerScroll` snippet.
 * Changes from the original for this project:
 *  - Converted from .tsx to .jsx (this app is Vite + JS, not Next.js/TS).
 *  - Removed `"use client"` (Next.js App Router directive, meaningless in Vite).
 *  - Removed `next/image`; uses a plain <img> since there's no Next.js image pipeline here.
 *  - Reduced the fixed heights (60rem/80rem) which were tuned for a full
 *    marketing page — used at a scale that fits this project's Landing hero
 *    section instead of taking over the whole viewport.
 * Reserved for the public Landing page hero only (see DESIGN_SYSTEM.md) —
 * intentionally not used inside the dashboards.
 */
export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1])

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions())
  const translate = useTransform(scrollYProgress, [0, 1], [0, -60])

  return (
    <div className="relative flex h-[42rem] items-center justify-center p-2 md:h-[56rem] md:p-10" ref={containerRef}>
      <div className="relative w-full py-6 md:py-24" style={{ perspective: '1000px' }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  )
}

export const Header = ({ translate, titleComponent }) => (
  <motion.div style={{ translateY: translate }} className="mx-auto max-w-5xl text-center">
    {titleComponent}
  </motion.div>
)

export const Card = ({ rotate, scale, children }) => (
  <motion.div
    style={{
      rotateX: rotate,
      scale,
      boxShadow:
        '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
    }}
    className="mx-auto -mt-8 h-[24rem] w-full max-w-5xl rounded-[30px] border-4 border-ink-700 bg-ink-950 p-2 shadow-2xl md:h-[32rem] md:p-6"
  >
    <div className="h-full w-full overflow-hidden rounded-2xl bg-ink-900 md:rounded-2xl md:p-4">{children}</div>
  </motion.div>
)
