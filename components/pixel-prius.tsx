"use client";

import { useState } from "react";
import { motion } from "motion/react";

/**
 * A little 2nd-gen Prius that drives across the bottom of the screen.
 * Summoned from the command menu. `fast` is rally mode.
 */
export function PixelPrius({
  fast = false,
  onDone,
}: {
  fast?: boolean;
  onDone: () => void;
}) {
  const [distance] = useState(() =>
    typeof window === "undefined" ? 1600 : window.innerWidth + 260
  );

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed -left-[130px] bottom-5 z-[120] text-fg"
      initial={{ x: 0 }}
      animate={{ x: distance }}
      transition={{ duration: fast ? 1.2 : 3.6, ease: "linear" }}
      onAnimationComplete={onDone}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny easter-egg sprite, next/image overhead not worth it */}
      <img src="/prius.png" alt="" width={110} height={40} />
      {fast && (
        <span className="absolute -left-10 top-3 font-mono text-[11px] tracking-[0.3em] text-faint">
          ✺✺
        </span>
      )}
    </motion.div>
  );
}
