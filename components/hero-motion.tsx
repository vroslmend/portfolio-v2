"use client";

import { useRef } from "react";

/**
 * Supplies pointer position to the opening plate without putting that state
 * through React on every frame. The design-lab mode decides how (or whether)
 * the variables are used; readable copy never receives a perpetual animation.
 */
export function HeroMotion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  function setPosition(clientX: number, clientY: number) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height - 0.5) * 2));
    node.style.setProperty("--hero-x", `${(x * 4).toFixed(2)}px`);
    node.style.setProperty("--hero-y", `${(y * 3).toFixed(2)}px`);
  }

  function resetPosition() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--hero-x", "0px");
    node.style.setProperty("--hero-y", "0px");
  }

  return (
    <section
      ref={ref}
      className={`hero-motion ${className ?? ""}`}
      onPointerMove={(event) => setPosition(event.clientX, event.clientY)}
      onPointerLeave={resetPosition}
    >
      {children}
    </section>
  );
}
