"use client";

import { motion, useReducedMotion } from "motion/react";

const BARS = [
  { duration: 0.9, delay: 0 },
  { duration: 1.15, delay: 0.18 },
  { duration: 0.8, delay: 0.36 },
];

/** Animated 3-bar equalizer glyph. Inherits colour via `bg-current`. */
export function Equalizer() {
  const reduced = useReducedMotion();
  return (
    <span aria-hidden className="flex h-3 shrink-0 items-end gap-0.5">
      {BARS.map((bar, i) => (
        <motion.span
          key={i}
          className="block h-3 w-0.5 origin-bottom bg-current"
          initial={{ scaleY: 0.4 }}
          animate={
            reduced ? { scaleY: 0.6 } : { scaleY: [0.35, 1, 0.45, 0.85, 0.35] }
          }
          transition={
            reduced
              ? { duration: 0.3, ease: "easeOut" }
              : {
                  duration: bar.duration,
                  delay: bar.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </span>
  );
}
