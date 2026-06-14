"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { EASE } from "@/lib/motion";

type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  url?: string | null;
};

const PEEK_MS = 4000; // how long the one-time auto-peek stays open
const CLOSE_MS = 1500; // delay before collapsing after the pointer leaves

const BARS = [
  { duration: 0.9, delay: 0 },
  { duration: 1.15, delay: 0.18 },
  { duration: 0.8, delay: 0.36 },
];

function Equalizer() {
  const reduced = useReducedMotion();
  return (
    <span aria-hidden className="flex h-3 shrink-0 items-end gap-0.5">
      {BARS.map((bar, i) => (
        <motion.span
          key={i}
          className="block h-3 w-0.5 origin-bottom bg-current"
          initial={{ scaleY: 0.4 }}
          animate={
            reduced ? { scaleY: 0.6 } : { scaleY: [0.35, 1, 0.45, 0.85, 0.35] }
          }
          transition={
            reduced
              ? { duration: 0.3, ease: "easeOut" }
              : {
                  duration: bar.duration,
                  delay: bar.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </span>
  );
}

/** The track title + artist, crossfading when the song changes. */
function TrackText({
  playing,
  trackKey,
}: {
  playing: NowPlaying;
  trackKey: string;
}) {
  return (
    <span className="relative block min-w-0 overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={trackKey}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="block truncate"
        >
          {playing.title}
          <span className="text-faint/60"> · </span>
          {playing.artist}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Always-shown line (every page except the home footer). */
function StaticLine({
  playing,
  trackKey,
}: {
  playing: NowPlaying;
  trackKey: string;
}) {
  return (
    <motion.a
      href={playing.url ?? "#"}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="group absolute inset-x-0 bottom-full mb-4 flex select-none items-center gap-2.5 font-mono text-[11px] tracking-[0.12em] text-faint"
    >
      <span className="shrink-0">listening to</span>
      <span className="flex min-w-0 items-center gap-2.5 text-muted transition-colors duration-300 group-hover:text-fg">
        <Equalizer />
        <TrackText playing={playing} trackKey={trackKey} />
      </span>
    </motion.a>
  );
}

/**
 * Collapsed to just the bars + song; the "listening to" label unfurls from the
 * side once when the footer first scrolls into view, tucks away after a beat,
 * and reopens on hover (closing shortly after the pointer leaves).
 */
function PeekLine({
  playing,
  trackKey,
}: {
  playing: NowPlaying;
  trackKey: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true });
  const peeked = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // one-time auto-peek the first time it scrolls into view
  useEffect(() => {
    if (!inView || peeked.current) return;
    peeked.current = true;
    setOpen(true);
    const t = setTimeout(() => setOpen(false), PEEK_MS);
    return () => clearTimeout(t);
  }, [inView]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <motion.a
      ref={ref}
      href={playing.url ?? "#"}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => {
        clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        closeTimer.current = setTimeout(() => setOpen(false), CLOSE_MS);
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="group absolute bottom-full left-0 mb-4 flex w-fit max-w-full select-none items-center font-mono text-[11px] tracking-[0.12em] text-faint"
    >
      {/* only "listening to" collapses; the bars + song stay visible */}
      <motion.span
        initial={false}
        animate={{ width: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="shrink-0 overflow-hidden"
      >
        <span className="inline-block whitespace-nowrap pr-2.5">
          listening to
        </span>
      </motion.span>
      <span className="flex min-w-0 items-center gap-2.5 text-muted transition-colors duration-300 group-hover:text-fg">
        <Equalizer />
        <TrackText playing={playing} trackKey={trackKey} />
      </span>
    </motion.a>
  );
}

export function NowPlaying() {
  const reduced = useReducedMotion();
  const [canHover, setCanHover] = useState(false);
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/now-playing");
        const json = (await res.json()) as NowPlaying;
        if (active) setData(json);
      } catch {
        /* ignore — the line just stays hidden */
      }
    };

    load();
    const id = setInterval(load, 20_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const playing = data?.isPlaying ? data : null;
  const trackKey = playing ? `${playing.title} ${playing.artist}` : "";

  // the peek/hover treatment only makes sense where hover exists and motion is
  // allowed; touch and reduced motion fall back to the static always-shown line
  const peek = canHover && !reduced;

  return (
    <AnimatePresence>
      {playing &&
        (peek ? (
          <PeekLine key="now-playing" playing={playing} trackKey={trackKey} />
        ) : (
          <StaticLine key="now-playing" playing={playing} trackKey={trackKey} />
        ))}
    </AnimatePresence>
  );
}
