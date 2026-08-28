"use client";

import {
  GodRays,
  GrainGradient,
  PaperTexture,
  PerlinNoise,
  Warp,
} from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

export type ShaderGround = "field" | "warp" | "perlin" | "paper" | "rays";

/**
 * True while the page is scrolling, false once it has been still for a beat.
 *
 * Stutter is only ever noticed while scrolling — that is the moment the phone
 * is already busy and the one where dropped frames are visible as judder.
 * Setting speed to 0 cancels the shader's rAF loop outright (documented as
 * costing nothing after the frame it stops on), so pausing here hands the whole
 * frame budget back to the scroll and gives the movement back the instant you
 * stop. You cannot watch a background drift while flinging the page anyway.
 */
function useScrolling(idleMs = 180) {
  const [scrolling, setScrolling] = useState(false);
  const active = useRef(false);

  useEffect(() => {
    let timer = 0;
    function onScroll() {
      if (!active.current) {
        active.current = true;
        setScrolling(true); // one render on start, one on stop — not per event
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        active.current = false;
        setScrolling(false);
      }, idleMs);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [idleMs]);

  return scrolling;
}

/**
 * BENCH: every shader ground in one place, so appending another is one case
 * rather than another file.
 *
 * Two rules apply to all of them.
 *
 * SIZING — only shaders that sample `v_patternUV` are safe here. Those tile and
 * have no centre. The ones sampling `v_objectUV` (GrainGradient's corners /
 * ripple / blob / sphere, and GodRays) put a lobe in the middle of the screen,
 * which is the blob this whole direction exists to remove. GrainGradient shapes
 * 1-3 are patterns, 4-7 are objects; Warp, PerlinNoise and SimplexNoise are all
 * patterns. `fit="none"` on top means the pattern fills at 1:1 and never maps a
 * world aspect ratio onto the canvas, so a document-height canvas under
 * `attach: scroll` distorts nothing.
 *
 * PIXEL BUDGET — `maxPixelCount` is the one that bites. The first pass capped it
 * at 1280x800 (1.02M). A phone at DPR 3 on a 412pt viewport wants ~3.2M, so the
 * shader rendered under the cap and CSS upscaled it, which reads as visible
 * blocky squares. It looks exactly like a taste problem and is not one. The cap
 * below clears a 3x phone while still protecting a 4K desktop.
 */
const MAX_PIXELS = 1920 * 1080 * 2; // ~4.1M: covers a DPR-3 phone, caps 4K

export function GroundShader({ variant }: { variant: ShaderGround }) {
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const scrolling = useScrolling();
  const light = resolvedTheme === "light";
  // one gate for every animated variant: still while scrolling, still under
  // reduced motion, moving otherwise
  const moving = !reduced && !scrolling;

  const common = {
    "aria-hidden": true as const,
    className: "ground-shader",
    fit: "none" as const,
    minPixelRatio: 1,
    maxPixelCount: MAX_PIXELS,
  };

  if (variant === "field") {
    return (
      <GrainGradient
        {...common}
        colorBack="rgba(0, 0, 0, 0)"
        colors={
          light
            ? ["rgba(255,255,255,0.55)", "rgba(120,112,96,0.10)", "rgba(150,142,126,0.05)"]
            : ["rgba(255,255,255,0.045)", "rgba(255,255,255,0.012)", "rgba(0,0,0,0.30)"]
        }
        // pattern shape (1-3) only — see the sizing note above
        shape="wave"
        softness={1}
        intensity={0.3}
        noise={0.9}
        // was 0.04, which was slow enough to read as static. Still well under
        // "look at me", but the page is now visibly alive if you rest on it.
        speed={moving ? 0.16 : 0}
        scale={2.4}
        rotation={18}
      />
    );
  }

  if (variant === "warp") {
    return (
      <Warp
        {...common}
        colors={
          light
            ? ["rgba(255,255,255,0.5)", "rgba(120,112,96,0.09)"]
            : ["rgba(255,255,255,0.05)", "rgba(0,0,0,0.28)"]
        }
        // "edge" rather than checks or stripes: the other two keep a legible
        // geometric base under the distortion, which reads as a pattern
        shape="edge"
        shapeScale={0.1}
        softness={1}
        distortion={0.28}
        swirl={0.6}
        swirlIterations={3}
        proportion={0.5}
        speed={moving ? 0.12 : 0}
        scale={1.7}
        rotation={24}
      />
    );
  }

  if (variant === "perlin") {
    return (
      <PerlinNoise
        {...common}
        colorBack={light ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)"}
        colorFront={light ? "rgba(120,112,96,0.16)" : "rgba(255,255,255,0.075)"}
        // few octaves and low persistence keeps it as a soft cloud rather than
        // a detailed noise field, which at this scale would read as dirt
        octaveCount={2}
        persistence={0.4}
        lacunarity={1.8}
        proportion={0.5}
        softness={0.9}
        speed={moving ? 0.14 : 0}
        scale={1.5}
      />
    );
  }

  if (variant === "paper") {
    return (
      <PaperTexture
        {...common}
        colorBack="rgba(0, 0, 0, 0)"
        colorFront={light ? "rgba(120,112,96,0.22)" : "rgba(255,255,255,0.09)"}
        // A real surface rather than a light: fibre and a few folds, no drops
        // (which read as dust specks and fight the film grain already on the
        // page). Static by nature — there is no speed on this one, which makes
        // it the cheapest shader here after the first frame.
        contrast={0.35}
        roughness={0.4}
        fiber={0.5}
        fiberSize={0.6}
        crumples={0.3}
        crumpleSize={0.5}
        foldCount={3}
        folds={0.2}
        drops={0}
        fade={0.3}
        seed={7}
        scale={1.2}
      />
    );
  }

  return (
    <GodRays
      {...common}
      colorBack="rgba(0, 0, 0, 0)"
      colorBloom={light ? "rgba(120,112,96,0.10)" : "rgba(255,255,255,0.05)"}
      colors={
        light
          ? ["rgba(255,255,255,0.55)", "rgba(150,142,126,0.16)"]
          : ["rgba(255,255,255,0.16)", "rgba(190,190,190,0.07)"]
      }
      offsetX={-0.85}
      offsetY={-0.8}
      midSize={0}
      midIntensity={0}
      density={0.32}
      spotty={0.72}
      intensity={light ? 0.55 : 0.45}
      bloom={0.6}
      speed={moving ? 0.05 : 0}
      scale={1.6}
    />
  );
}
