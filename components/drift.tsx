"use client";

import { useReducedMotion, motion, useScroll, useSpring, useTransform } from "motion/react";

/** Lets a block lag a few pixels behind the scroll for gentle depth. */
export function Drift({
  children,
  amount = 28,
  className,
}: {
  children: React.ReactNode;
  amount?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const raw = useTransform(scrollY, [0, 600], [0, amount]);
  const y = useSpring(raw, { stiffness: 120, damping: 24, mass: 0.4 });

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
