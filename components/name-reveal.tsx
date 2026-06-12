"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

const STAGGER = 0.028;

/** Per-letter mask reveal for the hero name. */
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
    <h1 className={`overflow-hidden ${className ?? ""}`} aria-label={`${text}.`}>
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ y: "115%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: delay + i * STAGGER }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
      <motion.span
        aria-hidden
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
    </h1>
  );
}
