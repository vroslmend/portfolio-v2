"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** 1px reading-progress hairline under the nav, for essay pages. */
export function ReadingProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
  });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-fg/60"
      style={{ scaleX }}
    />
  );
}
