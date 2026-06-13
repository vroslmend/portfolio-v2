"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

const STAGGER = 0.028;

/**
 * Per-letter mask reveal for the hero name.
 * Hovering swaps it to Urdu (and back).
 */
export function NameReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  if (reduced) {
    return (
      <h1 className={className}>
        {text}
        <span className="text-faint">.</span>
      </h1>
    );
  }

  const letters = text.split("");

  return (
    <h1
      className={`relative cursor-default select-none ${className ?? ""}`}
      aria-label={`${text}.`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* english layer (carries the entrance mask) */}
      <span
        aria-hidden
        className="block overflow-hidden transition-opacity duration-500 ease-out-expo"
        style={{ opacity: hovered ? 0 : 1 }}
      >
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.8,
              ease: EASE,
              delay: delay + i * STAGGER,
            }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
        <motion.span
          className="inline-block text-faint"
          initial={{ y: "115%" }}
          animate={{ y: 0 }}
          transition={{
            duration: 0.8,
            ease: EASE,
            delay: delay + letters.length * STAGGER,
          }}
        >
          .
        </motion.span>
      </span>

      {/* urdu layer (unclipped so nastaliq descenders can breathe) */}
      <span
        aria-hidden
        dir="rtl"
        lang="ur"
        className="font-urdu absolute inset-0 flex items-center justify-end gap-[0.3em] text-[0.94em] leading-none transition-[opacity,transform] duration-500 ease-out-expo"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(-0.15em)" : "translateY(0.18em)",
        }}
      >
        <span>عمار</span>
        <span>حسن</span>
      </span>
    </h1>
  );
}
