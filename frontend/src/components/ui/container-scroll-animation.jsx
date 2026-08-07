import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

/**
 * Blue + Purple themed ContainerScroll
 * UI theme updated only.
 */
export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);

  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());

  const translate = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div
      ref={containerRef}
      className="
      relative
      w-full
      py-6
      md:py-24
      "
      style={{
        perspective: "1000px",
      }}
    >
      <Header translate={translate} titleComponent={titleComponent} />

      <Card rotate={rotate} scale={scale}>
        {children}
      </Card>
    </div>
  );
};

export const Header = ({ translate, titleComponent }) => (
  <motion.div
    style={{
      translateY: translate,
    }}
    className="
    mx-auto
    max-w-5xl
    text-center
    "
  >
    {titleComponent}
  </motion.div>
);

export const Card = ({ rotate, scale, children }) => (
  <motion.div
    style={{
      rotateX: rotate,
      scale,

      boxShadow: `
        0 0 0 transparent,
        0 10px 25px rgba(59,130,246,0.15),
        0 35px 45px rgba(139,92,246,0.12),
        0 80px 60px rgba(0,0,0,0.08)
        `,
    }}
    className="
    mx-auto
    -mt-8

    h-[24rem]
    w-full
    max-w-5xl

    rounded-[30px]

    border
    border-blue-500/20

    bg-gradient-to-br
    from-white
    via-blue-50/60
    to-purple-50/60

    p-2

    shadow-2xl

    backdrop-blur-xl


    dark:border-white/10

    dark:bg-gradient-to-br
    dark:from-slate-950
    dark:via-blue-950/50
    dark:to-purple-950/50


    md:h-[32rem]
    md:p-6
    "
  >
    <div
      className="
      h-full
      w-full

      overflow-hidden

      rounded-2xl

      border
      border-blue-500/10

      bg-gradient-to-br
      from-white/80
      to-blue-50/40

      backdrop-blur-xl


      dark:border-white/10

      dark:bg-gradient-to-br
      dark:from-slate-900/90
      dark:to-purple-950/50


      md:rounded-2xl
      md:p-4
      "
    >
      {children}
    </div>
  </motion.div>
);
