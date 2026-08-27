"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

/** A low-contrast reflective field, clipped by the drawer itself. */
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
          ? ["rgba(255,255,255,0.24)", "rgba(120,112,96,0.055)", "rgba(255,255,255,0.12)"]
          : ["rgba(255,255,255,0.055)", "rgba(255,255,255,0.012)", "rgba(145,145,145,0.035)"]
      }
      shape="corners"
      softness={0.88}
      intensity={0.28}
      noise={0.62}
      speed={reduced ? 0 : 0.08}
      scale={1.15}
      minPixelRatio={1}
      maxPixelCount={1440 * 420}
    />
  );
}
