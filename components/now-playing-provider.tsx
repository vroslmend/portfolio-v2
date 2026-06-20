"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type NowPlayingData = {
  isPlaying: boolean;
  title: string | null;
  artist: string | null;
  albumArt: string | null;
  url: string | null;
};

const NowPlayingContext = createContext<NowPlayingData | null>(null);

/** The latest now-playing snapshot, shared by the footer widget and the About
 *  listening moment so they never drift out of sync. `null` until first load. */
export function useNowPlaying() {
  return useContext(NowPlayingContext);
}

// One poll for the whole app. 20s keeps the footer/About lively without
// hammering Spotify; the route's edge cache absorbs concurrent visitors.
const POLL_MS = 20_000;

export function NowPlayingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<NowPlayingData | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/now-playing", {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = (await res.json()) as NowPlayingData;
        if (active) setData(json);
      } catch {
        /* ignore (including AbortError) — keep the last good snapshot */
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
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

  return (
    <NowPlayingContext.Provider value={data}>
      {children}
    </NowPlayingContext.Provider>
  );
}
