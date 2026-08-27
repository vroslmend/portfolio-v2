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
import { DrawerAtmosphere } from "@/components/drawer-atmosphere";

const API = process.env.NEXT_PUBLIC_COUNTER_API_URL;
const PANEL = 248; // panel height (px) and the height it rises to
const DEAD = 160; // overscroll (px) absorbed before anything happens
const PEEK_SPAN = 150; // overscroll past DEAD that rises to the full peek
const PEEK_CEIL = 0.4; // how far it peeks before committing
const PEEK_CREEP = 0.1; // slight extra rise while pushing from peek toward commit
// Commit takes a deliberate push on a wheel — one stroke peeks and falls back,
// it opens only on a longer/second push. Touch already needs a real swipe, so
// that bar stays lighter.
const COMMIT_WHEEL = 600;
const COMMIT_TOUCH = 300;
const CLOSE = 150; // once open, scroll up until pull drops here -> snap closed
const IDLE_MS = 200; // a partial (uncommitted) peek springs back after this idle

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

// The refraction map. Green rises toward the leading edge, so feDisplacementMap
// samples further down the backdrop there and the page appears to bend around
// the rim; red stays neutral, so nothing shifts sideways. Chromium is the only
// engine that runs an SVG filter inside backdrop-filter today — the @supports
// guard in globals.css leaves every other engine on the plain blur, which is
// why the bend is confined to a 26px strip rather than the whole pane.
const GLASS_MAP =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='40' preserveAspectRatio='none'%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='rgb(128,255,128)'/%3E%3Cstop offset='0.45' stop-color='rgb(128,158,128)'/%3E%3Cstop offset='1' stop-color='rgb(128,128,128)'/%3E%3C/linearGradient%3E%3Crect width='4' height='40' fill='url(%23g)'/%3E%3C/svg%3E";

function GlassFilter() {
  return (
    <svg aria-hidden focusable="false" className="pointer-events-none absolute h-0 w-0">
      <filter
        id="drawer-glass"
        x="0"
        y="0"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feImage
          href={GLASS_MAP}
          result="map"
          x="0"
          y="0"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={26}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

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
  // kept out of the DOM entirely while resting (see below)
  const [panelShown, setPanelShown] = useState(false);
  const quip = useSyncExternalStore(emptySubscribe, pickQuip, () => QUIPS[0]);

  // reveal 0..1 springed -> bursty wheel becomes smooth motion
  const lift = useSpring(0, { stiffness: 210, damping: 22 });
  const y = useTransform(lift, (v) => Math.max(0, PANEL * (1 - v)));
  const hintOpacity = useMotionValue(0);
  // the panel's shadow + top hairline project upward, so while it sits off
  // screen they'd bleed back into the viewport (a translucent band stuck to the
  // bottom, worst on mobile Chrome as the address bar resizes the viewport).
  // Fade them in with the reveal so nothing shows until the panel actually rises.
  const edgeOpacity = useTransform(lift, [0, 0.12], [0, 1]);
  // The page dims behind the drawer. Without this the panel and the page sit at
  // the same brightness, which is exactly what makes them read as one plane —
  // occlusion is most of what says "this thing is in front". It leads slightly
  // during the peek so a partial pull already feels like something lifting.
  const dimOpacity = useTransform(lift, [0, 0.3, 1], [0, 0.22, 1]);
  // Mobile Chrome miscalculates a fixed + transformed element's position while
  // the address bar hides/shows on scroll, so an off-screen-via-translate panel
  // peeks above the toolbar mid-drag. visibility:hidden isn't enough (the
  // composited transform layer still gets mispainted), so we drop it from the
  // DOM with display:none until the gesture actually starts lifting it.
  useMotionValueEvent(lift, "change", (v) => setPanelShown(v > 0.0005));
  // lets the click-off scrim and Escape reuse the gesture's own close logic
  const closeRef = useRef<() => void>(() => {});
  const panelRef = useRef<HTMLElement>(null);
  const contentX = useSpring(0, { stiffness: 110, damping: 24, mass: 0.45 });
  const contentY = useSpring(0, { stiffness: 110, damping: 24, mass: 0.45 });

  function moveGlass(clientX: number, clientY: number) {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    panel.style.setProperty("--glass-x", `${(x * 100).toFixed(1)}%`);
    contentX.set((x - 0.5) * 5);
    contentY.set((y - 0.5) * 3.5);
  }

  function settleGlass() {
    const panel = panelRef.current;
    panel?.style.setProperty("--glass-x", "50%");
    contentX.set(0);
    contentY.set(0);
  }

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
    // expose close so a click off the panel / Escape can dismiss it too
    closeRef.current = release;
    function update(delta: number, commit: number) {
      pull = Math.max(0, pull + delta);
      if (open) {
        pull = Math.min(pull, commit);
        if (pull <= CLOSE) {
          release(); // scrolled back up enough -> snap closed
          return;
        }
        lift.set(1);
        return;
      }
      if (pull >= commit) {
        open = true; // crossed the commit point -> snap the rest of the way
        pull = commit;
        lift.set(1);
        setRevealed(true); // kick off the staggered content reveal
        return;
      }
      // peeking, not yet committed: rise quickly to the full peek, then a slow
      // creep toward the (further) commit point so it reads as resistance.
      const over = Math.max(0, pull - DEAD);
      let peek: number;
      if (over <= PEEK_SPAN) {
        peek = (over / PEEK_SPAN) * PEEK_CEIL;
      } else {
        const t = Math.min((over - PEEK_SPAN) / Math.max(1, commit - DEAD - PEEK_SPAN), 1);
        peek = PEEK_CEIL + t * PEEK_CREEP;
      }
      lift.set(peek);
      if (pull <= 0) release();
    }

    function onWheel(e: WheelEvent) {
      if (!engaged && !(atBottom() && e.deltaY > 0)) return;
      engage();
      e.preventDefault();
      update(e.deltaY, COMMIT_WHEEL);
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
      update(dy, COMMIT_TOUCH);
      touchY = e.touches[0].clientY;
    }
    function onTouchEnd() {
      if (!open) release(); // lift off mid-peek -> springs back closed
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) release();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);
    onScroll();
    return () => {
      clearTimeout(idle);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      lenis?.start(); // never leave Lenis paused
    };
  }, [reduced, lift, hintOpacity, lenis]);

  // No counts means the backend is unset or unreachable. Hiding is the same
  // thing the unset case already does, and beats rendering a confident zero.
  if (!API || !counts) return null;

  // reduced motion: no gesture, no animation — show a static panel
  if (reduced) {
    return (
      <section
        aria-hidden
        className="panel-glass drawer-pane relative flex cursor-default select-none items-center justify-center overflow-hidden border-t border-line px-6"
        style={{ height: PANEL }}
      >
        <GlassFilter />
        <DrawerAtmosphere />
        <div
          aria-hidden
          className="panel-bloom pointer-events-none absolute inset-0"
        />
        <div aria-hidden className="glass-bevel" />
        <div aria-hidden className="glass-sheen" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <span className="select-none font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
            past the end
          </span>
          <dl className="flex flex-col items-center gap-2.5 font-mono text-[13px] sm:flex-row sm:items-baseline sm:gap-10">
            <div className="flex items-baseline gap-3">
              <dt className="text-faint">visitors</dt>
              <dd className="tabular-nums text-fg">
                {counts.visits.toLocaleString()}
              </dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="text-faint">prius driven</dt>
              <dd className="tabular-nums text-fg">
                {counts.prius.toLocaleString()}×
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

      {/* Mounted for the whole gesture (not just once revealed) so the dim rides
          the pull in and back out. It only catches the click-off once the drawer
          has actually committed. */}
      {panelShown && (
        <motion.div
          aria-hidden
          onClick={() => closeRef.current()}
          style={{ opacity: dimOpacity, backgroundColor: "var(--drawer-dim)" }}
          className={`fixed inset-0 z-80 cursor-default backdrop-blur-[7px] ${
            revealed ? "" : "pointer-events-none"
          }`}
        />
      )}

      <motion.section
        ref={panelRef}
        aria-hidden
        style={{ y, height: PANEL, display: panelShown ? undefined : "none" }}
        onPointerMove={(event) => moveGlass(event.clientX, event.clientY)}
        onPointerLeave={settleGlass}
        className="panel-glass drawer-pane fixed inset-x-0 bottom-0 z-90 flex cursor-default select-none flex-col items-center justify-center overflow-hidden rounded-t-[18px] px-6"
      >
        <GlassFilter />
        <DrawerAtmosphere />
        <motion.div
          aria-hidden
          style={{ opacity: edgeOpacity }}
          className="panel-bloom pointer-events-none absolute inset-0"
        />
        <div aria-hidden className="glass-bevel" />
        <div aria-hidden className="glass-sheen" />
        {/* The cast shadow lives on this hairline rather than on the panel so it
            can fade with edgeOpacity: a shadow on the panel itself projects up
            into the viewport while the panel is still parked off-screen, which
            is the translucent band the mobile-Chrome note above is about. Broad
            and soft, because a drawer occludes the page over a wide falloff. */}
        <motion.div
          aria-hidden
          style={{ opacity: edgeOpacity }}
          className="glass-rim pointer-events-none absolute inset-x-0 top-0 z-4 h-px shadow-[0_-30px_70px_-8px_var(--shadow-dialog)]"
        />
        <motion.div
          variants={container}
          initial="hidden"
          animate={revealed ? "show" : "hidden"}
          style={{ x: contentX, y: contentY }}
          className="relative z-10 flex flex-col items-center gap-5"
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
