"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  /** Clip-mask rise (for single lines / headings) vs plain fade-up (for blocks). */
  mask?: boolean;
  className?: string;
  once?: boolean;
};

export function Reveal({
  children,
  delay = 0,
  mask = false,
  className,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  if (mask) {
    return (
      <div className={`overflow-hidden ${className ?? ""}`}>
        <motion.div
          initial={{ y: "110%" }}
          whileInView={{ y: 0 }}
          viewport={{ once, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: EASE, delay }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
