"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useLenis } from "lenis/react";
import { EASE } from "@/lib/motion";

const API = process.env.NEXT_PUBLIC_COUNTER_API_URL;
// First DEADZONE px of overscroll do nothing ("the scroll just stops"); only
// past that does the panel start to give. THRESHOLD is the full-reveal point.
const DEADZONE = 160;
const THRESHOLD = 650;
const SNAP = 0.4; // release past this fraction of the reveal -> snaps open

const QUIPS = [
  "these numbers live in a tiny database in mumbai.",
  "no cookies — just counting.",
  "the prius remains undefeated.",
  "thanks for scrolling past the end.",
  "you found the bottom of the world.",
];

type Counts = { visits: number; prius: number };

export function BeyondTheEnd() {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [quip] = useState(() => QUIPS[Math.floor(Math.random() * QUIPS.length)]);

  const progress = useMotionValue(0);
  const y = useTransform(progress, [0, 1], ["100%", "0%"]);
  const contentOpacity = useTransform(progress, [0.45, 1], [0, 1]);
  const hintOpacity = useMotionValue(0);

  // ----- counter data (runs for everyone, independent of the reveal) -----
  useEffect(() => {
    if (!API) return;
    let cancelled = false;
    (async () => {
      try {
        if (!sessionStorage.getItem("counted")) {
          sessionStorage.setItem("counted", "1");
          await fetch(`${API}/counts/visits/hit`, { method: "POST" });
        }
        const data = (await (await fetch(`${API}/counts`)).json()) as Counts;
        if (!cancelled) setCounts(data);
      } catch {
        /* non-critical */
      }
    })();

    function onDrove() {
      fetch(`${API}/counts/prius/hit`, { method: "POST" })
        .then((r) => r.json())
        .then((d: { prius: number }) =>
          setCounts((c) => (c ? { ...c, prius: d.prius } : c))
        )
        .catch(() => {});
    }
    window.addEventListener("prius-drove", onDrove);
    return () => {
      cancelled = true;
      window.removeEventListener("prius-drove", onDrove);
    };
  }, []);

  // ----- numbers count up the first time the panel is pulled open -----
  const [visitsShown, setVisitsShown] = useState(0);
  const [priusShown, setPriusShown] = useState(0);
  const visitsMV = useMotionValue(0);
  const priusMV = useMotionValue(0);
  const countedUp = useRef(false);
  useMotionValueEvent(visitsMV, "change", (v) => setVisitsShown(Math.round(v)));
  useMotionValueEvent(priusMV, "change", (v) => setPriusShown(Math.round(v)));

  function tryCountUp() {
    if (countedUp.current || !counts) return;
    if (progress.get() <= 0.5) return;
    countedUp.current = true;
    animate(visitsMV, counts.visits, { duration: 1.1, ease: EASE });
    animate(priusMV, counts.prius, { duration: 1.1, ease: EASE });
  }
  // fires whichever happens second: the panel opening, or the data arriving
  useMotionValueEvent(progress, "change", () => tryCountUp());
  useEffect(() => {
    if (!counts) return;
    if (countedUp.current) {
      // already revealed once — just reflect the latest values
      visitsMV.set(counts.visits);
      priusMV.set(counts.prius);
    } else {
      tryCountUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts]);

  // ----- the overscroll gesture -----
  useEffect(() => {
    if (reduced || !API) return;
    let over = 0;
    let engaged = false;
    let snapTimer: ReturnType<typeof setTimeout> | undefined;

    const docEl = document.documentElement;
    const atBottom = () =>
      window.scrollY + window.innerHeight >= docEl.scrollHeight - 2;

    // raw overscroll -> reveal fraction, with the deadzone absorbed up front
    const toProgress = (o: number) =>
      Math.max(0, Math.min(1, (o - DEADZONE) / (THRESHOLD - DEADZONE)));

    function apply(next: number) {
      over = Math.max(0, Math.min(THRESHOLD, next));
      progress.set(toProgress(over));
      if (over === 0 && engaged) {
        engaged = false;
        lenis?.start();
      }
    }

    function engage() {
      if (!engaged) {
        engaged = true;
        hintOpacity.set(0);
        lenis?.stop();
      }
    }

    function snap() {
      const target = toProgress(over) > SNAP ? THRESHOLD : 0;
      animate(over, target, {
        duration: 0.5,
        ease: EASE,
        onUpdate: (v) => apply(v),
      });
    }

    function onWheel(e: WheelEvent) {
      if (!engaged && !(atBottom() && e.deltaY > 0)) return;
      engage();
      e.preventDefault();
      apply(over + e.deltaY);
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snap, 130);
    }

    function onScroll() {
      if (!engaged) hintOpacity.set(atBottom() ? 1 : 0);
    }

    let touchY = 0;
    function onTouchStart(e: TouchEvent) {
      touchY = e.touches[0].clientY;
    }
    function onTouchMove(e: TouchEvent) {
      const dy = touchY - e.touches[0].clientY; // dragging up is positive
      if (!engaged && !(atBottom() && dy > 0)) return;
      engage();
      e.preventDefault();
      apply(over + dy);
      touchY = e.touches[0].clientY;
    }
    function onTouchEnd() {
      if (engaged) snap();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    onScroll();
    return () => {
      clearTimeout(snapTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      lenis?.start();
    };
  }, [reduced, progress, hintOpacity, lenis]);

  if (!API) return null;

  return (
    <>
      {/* whisper hint at the very bottom — fades in only when you're at the end */}
      <motion.div
        aria-hidden
        style={{ opacity: hintOpacity }}
        className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center font-mono text-[11px] tracking-[0.4em] text-faint"
      >
        ⌄
      </motion.div>

      {/* the panel beyond the end */}
      <motion.section
        aria-hidden
        style={{ y }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
      >
        <motion.div
          style={{ opacity: contentOpacity }}
          className="flex flex-col items-center gap-9"
        >
          <span className="select-none font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
            past the end
          </span>

          <dl className="flex flex-col gap-3 font-mono text-[13px]">
            <div className="flex items-baseline justify-between gap-12">
              <dt className="text-faint">visitors</dt>
              <dd className="tabular-nums text-fg">
                {visitsShown.toLocaleString()}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-12">
              <dt className="text-faint">prius driven</dt>
              <dd className="tabular-nums text-fg">
                {priusShown.toLocaleString()}×
              </dd>
            </div>
          </dl>

          <p className="max-w-[34ch] text-center text-[14px] leading-relaxed text-muted">
            {quip}
          </p>

          <span className="accent-serif text-[22px] text-faint">ah.</span>
        </motion.div>

        <motion.span
          style={{ opacity: contentOpacity }}
          className="absolute bottom-8 select-none font-mono text-[10px] tracking-[0.2em] text-faint"
        >
          scroll up to return
        </motion.span>
      </motion.section>
    </>
  );
}
