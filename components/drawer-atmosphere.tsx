"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

/**
 * Density inside the pane, not light on top of it. The colours sit close to the
 * drawer's own tint so the shader varies the smoke rather than washing it out;
 * the panel's brightness comes from its rim and sheen instead.
 */
export function DrawerAtmosphere() {
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const light = resolvedTheme === "light";

  return (
    <GrainGradient
      aria-hidden
      className="drawer-shader"
      colorBack="rgba(0, 0, 0, 0)"
      colors={
        light
          ? ["rgba(120,116,104,0.12)", "rgba(90,86,78,0.05)", "rgba(140,136,126,0.08)"]
          : ["rgba(255,255,255,0.026)", "rgba(255,255,255,0.006)", "rgba(150,150,150,0.018)"]
      }
      shape="corners"
      softness={0.92}
      intensity={0.2}
      noise={0.55}
      speed={reduced ? 0 : 0.07}
      scale={1.25}
      minPixelRatio={1}
      maxPixelCount={1440 * 420}
    />
  );
}
