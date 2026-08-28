"use client";

import { GodRays } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

/**
 * BENCH: "traces of something" — light from a source outside the frame.
 *
 * The centre glow is turned off entirely (midIntensity 0) and the origin is
 * pushed off the top-left corner, so what reaches the page is the tail of a
 * light rather than a sun sitting in the middle of it. That is the difference
 * between atmosphere and a graphic: you should never be able to point at where
 * it comes from.
 *
 * `spotty` high and `density` low keeps the rays broken and sparse instead of a
 * clean fan, which would read as decoration. Intensity is deliberately near the
 * floor — on #0e0e0e there is very little room before this stops being subtle.
 */
export function GroundRays() {
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const light = resolvedTheme === "light";

  return (
    <GodRays
      aria-hidden
      className="ground-shader"
      colorBack="rgba(0, 0, 0, 0)"
      colorBloom={light ? "rgba(120, 112, 96, 0.10)" : "rgba(255, 255, 255, 0.05)"}
      colors={
        light
          ? ["rgba(255, 255, 255, 0.55)", "rgba(150, 142, 126, 0.16)"]
          : ["rgba(255, 255, 255, 0.16)", "rgba(190, 190, 190, 0.07)"]
      }
      // no sun in the frame: the source sits off the top-left corner
      offsetX={-0.85}
      offsetY={-0.8}
      midSize={0}
      midIntensity={0}
      density={0.32}
      spotty={0.72}
      // The first pass measured a 0.31 level swing here, i.e. indistinguishable
      // from a flat page — subtle to the point of being unjudgeable. Raised so
      // there is actually something to react to; it is easier to dial a visible
      // thing down than to evaluate an invisible one.
      intensity={light ? 0.55 : 0.45}
      bloom={0.6}
      speed={reduced ? 0 : 0.05}
      fit="none"
      scale={1.6}
      minPixelRatio={1}
      maxPixelCount={1280 * 800}
    />
  );
}
