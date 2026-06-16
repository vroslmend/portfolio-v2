"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Reveal } from "@/components/reveal";
import { PhotoWall } from "@/components/photos/photo-wall";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import type { Photo } from "@/data/photos";

type ViewTransition = { finished: Promise<void> };
type Doc = Document & {
  startViewTransition?: (cb: () => void) => ViewTransition;
};

/** Resolve once `src` is decoded, or after `ms` so a slow load can't stall the
 *  morph. Decoding ahead of the transition means the image's dimensions are
 *  known when it mounts, so the morph snapshots it at full size in every engine
 *  (Firefox otherwise measures the unloaded image as tiny on open). */
function decodeWithTimeout(src: string, ms: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const img = new window.Image();
    img.src = src;
    img.decode().then(finish, finish);
    window.setTimeout(finish, ms);
  });
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  // Which tile currently owns the shared `photo-hero` name. Set just before a
  // transition so the morph's "old" snapshot captures it on the tile, and the
  // dialog image takes the name only once the tile has released it.
  const [hero, setHero] = useState<number | null>(null);
  // The caption fades in only once the morph has finished (see go), so it reads
  // as its own beat instead of being lost inside the image morph.
  const [settled, setSettled] = useState(true);
  // True while a morph is mid-flight. Starting a second transition over a live
  // one makes the browser skip the first (a judder, worst in Firefox), so a
  // press during a morph jumps instantly instead of stacking transitions.
  const busy = useRef(false);

  function set(next: number | null) {
    if (next !== null) setHero(next);
    setExpanded(next);
  }

  async function go(next: number | null) {
    const doc = document as Doc;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduced || busy.current) {
      set(next);
      setSettled(true);
      return;
    }
    busy.current = true;
    setSettled(false); // hide the caption; it fades back in after the morph

    // Decode the destination image before the transition so its dimensions are
    // known when the dialog <img> mounts. The morph then snapshots it full size
    // in every engine (without this, Firefox measures the unloaded image as
    // tiny on open). Race a timeout so a slow decode never stalls a click; the
    // hover/neighbour decodes usually mean it has already resolved.
    if (next !== null) await decodeWithTimeout(photos[next].image.src, 500);

    // Opening: the old snapshot is captured before the callback runs, so the
    // target tile must already carry `photo-hero` — paint it synchronously now.
    const opening = expanded === null && next !== null;
    if (opening) flushSync(() => setHero(next));

    // Freeze the root group for the duration: only `photo-hero` should morph.
    // Otherwise the whole wall crossfades, and any tile still decoding its lazy
    // image on the first open flickers blur→full as the "odd one out".
    const root = document.documentElement;
    root.classList.add("photo-vt");
    // Stepping between two open photos: let the hero crossfade (a slide-less
    // dissolve between the two images) rather than the hard-hold open/close use.
    const stepping = expanded !== null && next !== null;
    if (stepping) root.classList.add("photo-vt-step");

    const vt = doc.startViewTransition(() => flushSync(() => set(next)));

    // `catch` so a skipped/aborted transition still cleans up.
    vt.finished.catch(() => {}).finally(() => {
      root.classList.remove("photo-vt", "photo-vt-step");
      busy.current = false;
      setSettled(true); // morph done: let the caption rise in
      // Once fully closed, drop the name so no stray tile participates in an
      // unrelated transition (e.g. the theme toggle, which also uses View
      // Transitions).
      if (next === null) setHero(null);
    });
  }

  return (
    <>
      <Reveal delay={0.18}>
        <PhotoWall
          photos={photos}
          hero={hero}
          expanded={expanded}
          onOpen={go}
        />
      </Reveal>
      <PhotoLightbox
        photos={photos}
        index={expanded}
        settled={settled}
        onClose={() => go(null)}
        onNavigate={(i) => go(i)}
      />
    </>
  );
}
