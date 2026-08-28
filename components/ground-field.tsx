"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

/**
 * BENCH: the ground as a grainy field rather than as gradients.
 *
 * The point of the shader here is not the gradient, it is the grain. Banding
 * comes from a smooth luminance ramp quantising into 8-bit steps; a field whose
 * luminance varies per pixel has no smooth ramp to quantise, so it cannot band.
 * The grain is its own dither. `noise` is therefore pushed near the top of its
 * range — it is doing the load-bearing work, not decorating.
 *
 * `shape="wave"` is load-bearing and was chosen from the shader source, not by
 * eye. GrainGradient's shapes split in two: 1-3 (wave, dots, truchet) sample
 * `v_patternUV` and tile, while 4-7 (corners, ripple, blob, sphere) sample
 * `v_objectUV` and therefore have a centre. An object shape puts a lobe in the
 * middle of the screen — measured at +2.2 levels over the surround with
 * `corners`, which is precisely the blob this whole direction exists to avoid.
 * Only a pattern shape is safe here.
 *
 * `fit="none"` is what makes this survive `attach: scroll`. It fills the canvas
 * at 1:1 rather than mapping a world aspect ratio onto it, so stretching the
 * element to document height stretches nothing — which is exactly what went
 * wrong with the gradient shapes.
 */
export function GroundField() {
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const light = resolvedTheme === "light";

  return (
    <GrainGradient
      aria-hidden
      className="ground-shader"
      colorBack="rgba(0, 0, 0, 0)"
      colors={
        light
          ? [
              "rgba(255, 255, 255, 0.55)",
              "rgba(120, 112, 96, 0.10)",
              "rgba(150, 142, 126, 0.05)",
            ]
          : [
              "rgba(255, 255, 255, 0.045)",
              "rgba(255, 255, 255, 0.012)",
              "rgba(0, 0, 0, 0.30)",
            ]
      }
      shape="wave"
      softness={1}
      intensity={0.3}
      noise={0.9}
      // Slow enough that you never catch it moving, only notice the page is not
      // dead. Reduced motion stops the rAF loop outright (speed 0 is documented
      // as costing nothing after the first frame).
      speed={reduced ? 0 : 0.04}
      fit="none"
      // a large scale keeps the wave's structures well bigger than the
      // viewport, so what shows is a slow gradation across the screen rather
      // than a readable pattern
      scale={2.4}
      rotation={18}
      // A full-viewport background does not need 2x supersampling; the default
      // minPixelRatio of 2 would quadruple fill rate for no visible gain on a
      // field this soft. The cap keeps a tall document canvas off the GPU cliff.
      minPixelRatio={1}
      maxPixelCount={1280 * 800}
    />
  );
}
