"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { Equalizer } from "@/components/equalizer";

type ListeningState = {
  isPlaying: boolean;
  title: string | null;
  artist: string | null;
  albumArt: string | null;
  url: string | null;
};

function SpotifyGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="h-3 w-3"
    >
      <path d="M12 2.163A9.842 9.842 0 0 0 2.158 12a9.842 9.842 0 0 0 9.842 9.837 9.842 9.842 0 0 0 9.842-9.837A9.842 9.842 0 0 0 12 2.163zm4.593 14.073a.742.742 0 0 1-1.041.218 5.918 5.918 0 0 0-3.552-1.22 5.91 5.91 0 0 0-3.563 1.22.742.742 0 0 1-1.04-.218.742.742 0 0 1 .218-1.041 7.393 7.393 0 0 1 4.385-1.515 7.383 7.383 0 0 1 4.385 1.515.742.742 0 0 1 .218 1.04zm1.48-2.33a.742.742 0 0 1-1.21-.491 8.217 8.217 0 0 0-4.863-1.638 8.217 8.217 0 0 0-4.863 1.638.742.742 0 0 1-1.21.491.742.742 0 0 1-.49-1.21 9.7 9.7 0 0 1 5.72-1.93 9.7 9.7 0 0 1 5.72 1.93.742.742 0 0 1-.49 1.21zM6.538 9.94a.742.742 0 0 1 .594-1.127 10.957 10.957 0 0 1 5.48-.48 10.957 10.957 0 0 1 5.48.48.742.742 0 1 1-.594 1.127 9.477 9.477 0 0 0-4.886-.407 9.477 9.477 0 0 0-4.886.407.742.742 0 0 1-.594 0z" />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="h-[34px] w-[34px] shrink-0 rounded bg-surface" />
      <div className="h-3 w-32 rounded-sm bg-surface" />
    </div>
  );
}

export function NowListening() {
  const [data, setData] = useState<ListeningState | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/now-playing", {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = (await res.json()) as ListeningState;
        if (active) setData(json);
      } catch {
        /* ignore (including AbortError) — the panel just keeps its last state */
      }
    }

    load();
    const id = setInterval(load, 25_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      controller.abort();
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // No track yet (cold load, or Spotify unreachable): hold a measurable height
  // so the grid-rows reveal never resolves 1fr to ~0.
  if (!data?.title) return <Skeleton />;

  const playing = data.isPlaying;
  const trackKey = `${data.title} ${data.artist}`;

  return (
    <a
      href={data.url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="group/listening flex items-center gap-3.5"
    >
      <span className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded bg-surface">
        {data.albumArt && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.albumArt}
            alt=""
            width={34}
            height={34}
            className="album-thumb h-full w-full object-cover"
          />
        )}
      </span>

      <span className="relative block min-w-0 flex-1 overflow-hidden text-sm">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={trackKey}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="block truncate"
          >
            <span className="text-fg">{data.title}</span>
            <span className="text-faint/60"> · </span>
            <span className="text-muted">{data.artist}</span>
          </motion.span>
        </AnimatePresence>
      </span>

      <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-faint transition-colors duration-300 group-hover/listening:text-muted">
        {playing ? (
          <span className="flex items-center gap-1.5 text-muted">
            <Equalizer />
            <span>playing</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-[5px] w-[5px] rounded-full bg-current"
            />
            <span>last played</span>
          </span>
        )}
        <span className="inline-block transition-transform duration-500 ease-out-expo group-hover/listening:translate-x-0.5">
          <SpotifyGlyph />
        </span>
      </span>
    </a>
  );
}
