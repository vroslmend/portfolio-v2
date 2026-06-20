"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { EASE } from "@/lib/motion";
import { Equalizer } from "@/components/equalizer";
import {
  useNowPlaying,
  type NowPlayingData,
} from "@/components/now-playing-provider";

type NowPlaying = NowPlayingData;

const PEEK_MS = 4000; // how long the one-time auto-peek stays open
const CLOSE_MS = 1500; // delay before collapsing after the pointer leaves

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
  const data = useNowPlaying();

  const playing = data?.isPlaying ? data : null;
  const trackKey = playing ? `${playing.title} ${playing.artist}` : "";

  // peek/collapse everywhere except reduced motion (which keeps the static line).
  // On touch the hover-reopen just doesn't fire, but the auto-peek + collapse do.
  const peek = !reduced;

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
