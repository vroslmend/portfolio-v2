"use client";

import type { RefObject } from "react";
import { motion, useScroll, useSpring } from "motion/react";

/** 1px reading-progress hairline under the nav, for essay pages. */
export function ReadingProgress({
  target,
}: {
  target: RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-fg/60 motion-reduce:hidden"
      style={{ scaleX }}
    />
  );
}
