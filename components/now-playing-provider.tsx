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

    // The interval only runs while the tab is visible. A backgrounded tab used
    // to keep polling forever, which is 180 requests an hour against the route
    // and Spotify for a widget nobody is looking at. Keep the stop, and don't
    // collapse this back into a bare setInterval.
    let timer: ReturnType<typeof setInterval> | undefined;

    function start() {
      timer ??= setInterval(load, POLL_MS);
    }
    function stop() {
      clearInterval(timer);
      timer = undefined;
    }

    function sync() {
      if (document.visibilityState === "visible") {
        load(); // whatever is on screen went stale while we were away
        start();
      } else {
        stop();
      }
    }

    // Read the state rather than assuming visible: a tab can be opened in the
    // background, or restored from bfcache while still hidden.
    sync();
    document.addEventListener("visibilitychange", sync);

    return () => {
      active = false;
      controller.abort();
      stop();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <NowPlayingContext.Provider value={data}>
      {children}
    </NowPlayingContext.Provider>
  );
}
