"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Magnetic pull. The outer element stays static and owns the hit area —
 * only the inner element translates. If the hit area itself moved, the
 * pointer could fall off the edge mid-pull, flickering :hover on and off.
 *
 * Only runs on a real hover+fine-pointer device. Touch browsers emulate
 * mousemove on tap but don't reliably fire mouseleave, which would leave the
 * element translated and stuck at a random offset, so there we render static.
 */
export function Magnetic({
  children,
  strength = 0.25,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function onMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  if (reduced || !enabled) {
    return (
      <div className="magnetic-area inline-block">
        <div className="inline-block">{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="magnetic-area inline-block"
    >
      <motion.div style={{ x: sx, y: sy }} className="inline-block">
        {children}
      </motion.div>
    </div>
  );
}
