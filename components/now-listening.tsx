"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { SoundWave } from "@/components/sound-wave";
import { useNowPlaying } from "@/components/now-playing-provider";

function Skeleton() {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="h-2.5 w-16 rounded-sm bg-surface" />
      <div className="h-5 w-52 max-w-full rounded bg-surface" />
      <div className="h-3 w-24 rounded-sm bg-surface" />
    </div>
  );
}

export function NowListening({ open = false }: { open?: boolean }) {
  const data = useNowPlaying();

  // No track yet (cold load, or Spotify unreachable): a faint placeholder that
  // holds the block's height so the reveal never collapses to nothing.
  if (!data?.title) return <Skeleton />;

  const playing = data.isPlaying;
  const trackKey = `${data.title} ${data.artist}`;

  // A centered liner-note: a faint mono kicker (the state), the track title in
  // the site's serif-italic accent, the artist beneath, and a delicate
  // generative soundwave that comes alive only while it's actually playing.
  return (
    <a
      href={data.url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="group/listening inline-flex max-w-[34ch] flex-col items-center gap-1.5 text-center"
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint transition-colors duration-300 group-hover/listening:text-muted">
        {playing ? "now playing" : "last played"}
      </span>

      <span className="relative block">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={trackKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="block"
          >
            <span className="block text-balance font-serif text-[19px] italic leading-[1.3] tracking-[0.01em] text-fg sm:text-[20px]">
              {data.title}
            </span>
            <span className="mt-1.5 block text-[14px] text-muted transition-colors duration-300 group-hover/listening:text-fg">
              {data.artist}
            </span>
          </motion.span>
        </AnimatePresence>
      </span>

      <span className="sound-wave mt-2.5 block">
        <SoundWave active={playing && open} />
      </span>
    </a>
  );
}
