"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

// A delicate generative soundwave — two gently counter-drifting sine layers
// under a taper envelope, so the line breathes and interferes softly without
// ever looking random. Spotify exposes no real-time audio, so this is honest
// ambient motion, not a fake frequency readout. It flows only while a track is
// actually playing; otherwise it's a flat hairline.

const W = 240;
const H = 22;
const POINTS = 72;
const AMP = 6;
const MID = H / 2;
const FLAT = `M0 ${MID} L${W} ${MID}`;

// Catmull-Rom → cubic bezier, for a silky line through the sampled points
function smoothPath(pts: { x: number; y: number }[]) {
  let d = `M${pts[0].x} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(2)} ${c2x.toFixed(1)} ${c2y.toFixed(2)} ${p2.x.toFixed(1)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function wavePath(time: number) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < POINTS; i++) {
    const t = i / (POINTS - 1);
    // taper amplitude to zero at both ends so the line eases into the midline
    const env = Math.sin(Math.PI * t);
    const y =
      MID +
      env *
        AMP *
        (0.6 * Math.sin(i * 0.3 + time * 1.6) +
          0.4 * Math.sin(i * 0.13 - time * 1.1));
    pts.push({ x: t * W, y });
  }
  return smoothPath(pts);
}

export function SoundWave({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!active) {
      el.setAttribute("d", FLAT);
      return;
    }
    if (reduced) {
      el.setAttribute("d", wavePath(0));
      return;
    }

    let raf = 0;
    let running = true;
    const start = performance.now();
    const loop = (now: number) => {
      el.setAttribute("d", wavePath((now - start) / 1000));
      if (running) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // don't burn frames behind a hidden tab
    const onVisible = () => {
      if (document.visibilityState === "hidden") {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, reduced]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      // viewBox + CSS sizing (not width/height attrs) so it scales down
      // proportionally on narrow screens instead of overflowing.
      className="block h-auto w-60 max-w-full text-faint/70"
      style={{
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        maskImage:
          "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
      }}
    >
      <path
        ref={ref}
        d={FLAT}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
