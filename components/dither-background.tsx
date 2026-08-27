"use client";

import { Dithering } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

/**
 * The deliberately more graphic alternative to the CSS film grain.
 *
 * Both shader colours are transparent, so the lit body ground remains the
 * actual background. The shader only lays down a sparse field of monochrome
 * "ink" instead of replacing the page with an opaque WebGL scene.
 */
export function DitherBackground() {
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const light = resolvedTheme === "light";

  return (
    <Dithering
      aria-hidden
      className="dither-background"
      colorBack="rgba(0, 0, 0, 0)"
      colorFront={
        light ? "rgba(26, 25, 21, 0.035)" : "rgba(255, 255, 255, 0.04)"
      }
      shape="simplex"
      type="4x4"
      size={2.5}
      scale={0.72}
      speed={reduceMotion ? 0 : 0.08}
      minPixelRatio={1}
      maxPixelCount={1920 * 1080}
    />
  );
}
