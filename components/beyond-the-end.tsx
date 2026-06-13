"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useLenis } from "lenis/react";
import { EASE } from "@/lib/motion";

const API = process.env.NEXT_PUBLIC_COUNTER_API_URL;
const PANEL = 248; // panel height (px) and the height it rises to
const DEAD = 160; // overscroll (px) absorbed before anything happens
const COMMIT = 300; // overscroll at which it snaps the rest of the way open
const PEEK_CEIL = 0.38; // how far it peeks during the drag, before committing
const CLOSE = 150; // once open, scroll up until pull drops here -> snap closed
const IDLE_MS = 150; // a partial (uncommitted) peek springs back after this idle

const QUIPS = [
  "these numbers live in a tiny database in the cloud.",
  "most people never scroll this far.",
  "the prius remains undefeated.",
  "thanks for scrolling past the end.",
  "you found the bottom of the world.",
];

// staggered entrance: the panel commits, then each line settles in turn
const container = {
  hidden: {},
  show: { transition: { delayChildren: 0.18, staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

type Counts = { visits: number; prius: number };

// stable per-client random pick; SSR + hydration always see QUIPS[0]
let clientQuip: string | null = null;
const pickQuip = () =>
  (clientQuip ??= QUIPS[Math.floor(Math.random() * QUIPS.length)]);
const emptySubscribe = () => () => {};

export function BeyondTheEnd() {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [revealed, setRevealed] = useState(false);
  const quip = useSyncExternalStore(emptySubscribe, pickQuip, () => QUIPS[0]);

  // reveal 0..1 springed -> bursty wheel becomes smooth motion
  const lift = useSpring(0, { stiffness: 210, damping: 22 });
  const y = useTransform(lift, (v) => Math.max(0, PANEL * (1 - v)));
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

  // ----- numbers roll up the first time the panel is revealed -----
  const [visitsShown, setVisitsShown] = useState(0);
  const [priusShown, setPriusShown] = useState(0);
  const visitsMV = useMotionValue(0);
  const priusMV = useMotionValue(0);
  const countedUp = useRef(false);
  useMotionValueEvent(visitsMV, "change", (v) => setVisitsShown(Math.round(v)));
  useMotionValueEvent(priusMV, "change", (v) => setPriusShown(Math.round(v)));

  // The roll waits for the stats line to finish sliding in, so it counts on a
  // settled, visible row. easeInOut ticks at an even pace start to finish.
  useEffect(() => {
    if (!revealed || !counts || countedUp.current) return;
    countedUp.current = true;
    const opts = { duration: 1.5, ease: "easeInOut" as const, delay: 0.55 };
    animate(visitsMV, counts.visits, opts);
    animate(priusMV, counts.prius, opts);
  }, [revealed, counts, visitsMV, priusMV]);

  // once counted, keep the shown numbers in sync (e.g. a fresh prius hit)
  useEffect(() => {
    if (!counts || !countedUp.current) return;
    visitsMV.set(counts.visits);
    priusMV.set(counts.prius);
  }, [counts, visitsMV, priusMV]);

  // ----- the bottom-sheet snap gesture -----
  useEffect(() => {
    if (reduced || !API) return;
    let pull = 0; // accumulated overscroll (px)
    let open = false; // committed-open state
    let engaged = false;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const docEl = document.documentElement;
    const atBottom = () =>
      window.scrollY + window.innerHeight >= docEl.scrollHeight - 2;

    function engage() {
      if (!engaged) {
        engaged = true;
        lenis?.stop(); // freeze the viewport at the bottom while pulling
        hintOpacity.set(0);
      }
    }
    function release() {
      engaged = false;
      open = false;
      pull = 0;
      lift.set(0);
      setRevealed(false);
      lenis?.start();
    }
    function update(delta: number) {
      pull = Math.max(0, pull + delta);
      if (open) {
        pull = Math.min(pull, COMMIT);
        if (pull <= CLOSE) {
          release(); // scrolled back up enough -> snap closed
          return;
        }
        lift.set(1);
        return;
      }
      if (pull >= COMMIT) {
        open = true; // crossed the commit point -> snap the rest of the way
        pull = COMMIT;
        lift.set(1);
        setRevealed(true); // kick off the staggered content reveal
        return;
      }
      // peeking, not yet committed
      const peek = ((pull - DEAD) / (COMMIT - DEAD)) * PEEK_CEIL;
      lift.set(Math.max(0, peek));
      if (pull <= 0) release();
    }

    function onWheel(e: WheelEvent) {
      if (!engaged && !(atBottom() && e.deltaY > 0)) return;
      engage();
      e.preventDefault();
      update(e.deltaY);
      clearTimeout(idle);
      // a partial peek that you stop on springs back closed
      idle = setTimeout(() => {
        if (!open) release();
      }, IDLE_MS);
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
      update(dy);
      touchY = e.touches[0].clientY;
    }
    function onTouchEnd() {
      if (!open) release(); // lift off mid-peek -> springs back closed
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    onScroll();
    return () => {
      clearTimeout(idle);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      lenis?.start(); // never leave Lenis paused
    };
  }, [reduced, lift, hintOpacity, lenis]);

  if (!API) return null;

  // reduced motion: no gesture, no animation — show a static panel
  if (reduced) {
    return (
      <section
        aria-hidden
        className="flex cursor-default select-none items-center justify-center border-t border-line px-6"
        style={{ height: PANEL }}
      >
        <div className="flex flex-col items-center gap-5">
          <span className="select-none font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
            past the end
          </span>
          <dl className="flex flex-col items-center gap-2.5 font-mono text-[13px] sm:flex-row sm:items-baseline sm:gap-10">
            <div className="flex items-baseline gap-3">
              <dt className="text-faint">visitors</dt>
              <dd className="tabular-nums text-fg">
                {(counts?.visits ?? 0).toLocaleString()}
              </dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="text-faint">prius driven</dt>
              <dd className="tabular-nums text-fg">
                {(counts?.prius ?? 0).toLocaleString()}×
              </dd>
            </div>
          </dl>
          <p className="max-w-[34ch] text-center text-[13.5px] text-muted">
            {quip}
          </p>
          <span className="accent-serif text-[20px] text-faint">ah.</span>
        </div>
      </section>
    );
  }

  return (
    <>
      <motion.div
        aria-hidden
        style={{ opacity: hintOpacity }}
        className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center font-mono text-[11px] tracking-[0.4em] text-faint"
      >
        <motion.span
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          ⌄
        </motion.span>
      </motion.div>

      <motion.section
        aria-hidden
        style={{ y, height: PANEL }}
        className="fixed inset-x-0 bottom-0 z-90 flex cursor-default select-none flex-col items-center justify-center border-t border-line bg-bg px-6"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate={revealed ? "show" : "hidden"}
          className="flex flex-col items-center gap-5"
        >
          <motion.span
            variants={item}
            className="select-none font-mono text-[10px] uppercase tracking-[0.3em] text-faint"
          >
            past the end
          </motion.span>
          <motion.dl
            variants={item}
            className="flex flex-col items-center gap-2.5 font-mono text-[13px] sm:flex-row sm:items-baseline sm:gap-10"
          >
            <div className="flex items-baseline gap-3">
              <dt className="text-faint">visitors</dt>
              <dd className="tabular-nums text-fg">
                {visitsShown.toLocaleString()}
              </dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="text-faint">prius driven</dt>
              <dd className="tabular-nums text-fg">
                {priusShown.toLocaleString()}×
              </dd>
            </div>
          </motion.dl>
          <motion.p
            variants={item}
            className="max-w-[34ch] text-center text-[13.5px] text-muted"
          >
            {quip}
          </motion.p>
          <motion.span
            variants={item}
            className="accent-serif text-[20px] text-faint"
          >
            ah.
          </motion.span>
        </motion.div>
      </motion.section>
    </>
  );
}
