"use client";

import { useState } from "react";
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

  async function go(next: number | null) {
    const doc = document as Doc;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduced) {
      if (next !== null) setHero(next);
      setExpanded(next);
      return;
    }

    // Decode the destination image before the transition so its dimensions are
    // known when the dialog <img> mounts. The morph then snapshots it full size
    // in every engine (without this, Firefox measures the unloaded image as
    // tiny on open). Race a short timeout so a slow decode never stalls a click.
    if (next !== null) await decodeWithTimeout(photos[next].image.src, 300);

    // Opening: the old snapshot is captured before the callback runs, so the
    // target tile must already carry `photo-hero` — paint it synchronously now.
    const opening = expanded === null && next !== null;
    if (opening) flushSync(() => setHero(next));

    // Freeze the root group for the duration: only `photo-hero` should morph.
    // Otherwise the whole wall crossfades, and any tile still decoding its lazy
    // image on the first open flickers blur→full as the "odd one out".
    const root = document.documentElement;
    root.classList.add("photo-vt");

    const vt = doc.startViewTransition(() =>
      flushSync(() => {
        if (next !== null) setHero(next);
        setExpanded(next);
      }),
    );

    vt.finished.then(() => {
      root.classList.remove("photo-vt");
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
      <PhotoLightbox photos={photos} index={expanded} onClose={() => go(null)} />
    </>
  );
}
