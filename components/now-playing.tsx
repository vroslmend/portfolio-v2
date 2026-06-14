"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  url?: string | null;
};

// three bars, each on its own cadence so they bob out of phase
const BARS = [
  { duration: 0.9, delay: 0 },
  { duration: 1.15, delay: 0.18 },
  { duration: 0.8, delay: 0.36 },
];

function Equalizer() {
  const reduced = useReducedMotion();
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {BARS.map((bar, i) => (
        <motion.span
          key={i}
          className="block h-3 w-[2px] origin-bottom bg-current"
          initial={{ scaleY: 0.4 }}
          animate={reduced ? { scaleY: 0.6 } : { scaleY: [0.35, 1, 0.45, 0.85, 0.35] }}
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

export function NowPlaying() {
  const [data, setData] = useState<NowPlaying | null>(null);

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
    // poll often enough that stopping/skipping a track updates on its own,
    // and refetch the moment the tab is focused again
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
  const trackKey = playing ? `${playing.title} ${playing.artist}` : "";

  return (
    <AnimatePresence>
      {playing && (
        <motion.a
          key="now-playing"
          href={playing.url ?? "#"}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.45, ease: EASE }}
          // Absolute + anchored just above the footer's top border: showing or
          // hiding it never reflows the footer (no shift) and it reserves no
          // space when idle (no bulk). It lives in the footer's empty top padding.
          className="group absolute inset-x-0 bottom-full mb-4 flex select-none items-center gap-2.5 font-mono text-[11px] tracking-[0.12em] text-faint"
        >
          <span className="shrink-0">listening to</span>
          <span className="flex min-w-0 items-center gap-2.5 text-muted transition-colors duration-300 group-hover:text-fg">
            <Equalizer />
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
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
