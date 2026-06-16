"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLenis } from "lenis/react";
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
  // How the dialog image is named for the next transition. "morph" shares
  // `photo-hero` with the tile (open/close grow-shrink). "cross" gives it a
  // non-shared, alternating name so stepping between two different photos
  // dissolves in place instead of morphing one box into the other (which, with
  // differing aspect ratios, looked like an awkward vertical collapse).
  const [mode, setMode] = useState<"morph" | "cross">("morph");
  // True while a morph is mid-flight. Starting a second transition over a live
  // one makes the browser skip the first (a judder, worst in Firefox), so a
  // press during a morph jumps instantly instead of stacking transitions.
  const busy = useRef(false);

  // Lock background scroll while the lightbox is open. A native showModal()
  // dialog does not stop the page scrolling behind it, and Lenis owns the
  // scroll, so pause Lenis on open and resume on close (plain overflow:hidden
  // would fight Lenis). Without this the wall drifts under the photo and the
  // close morph can snap back to a tile that has moved.
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    if (expanded !== null) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [lenis, expanded]);

  function set(next: number | null) {
    if (next !== null) setHero(next);
    setExpanded(next);
  }

  async function go(next: number | null) {
    const doc = document as Doc;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const opening = expanded === null && next !== null;
    const closing = next === null;
    const stepping = expanded !== null && next !== null;

    if (!doc.startViewTransition || reduced || busy.current) {
      set(next);
      if (next !== null) setMode(stepping ? "cross" : "morph");
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
    if (next !== null) await decodeWithTimeout(photos[next].src, 500);

    // Opening: the old snapshot is captured before the callback runs, so the
    // target tile must already carry `photo-hero` — paint it synchronously now.
    if (opening) flushSync(() => setHero(next));
    // Closing: a prior nav may have left the dialog on a `cross` name; restore
    // `photo-hero` before the old snapshot so it morphs back to the tile.
    if (closing) flushSync(() => setMode("morph"));

    // Freeze the root group for the duration: only the photo should animate.
    // Otherwise the whole wall crossfades, and any tile still decoding its lazy
    // image on the first open flickers blur→full as the "odd one out".
    const root = document.documentElement;
    root.classList.add("photo-vt");

    const vt = doc.startViewTransition(() =>
      flushSync(() => {
        setMode(stepping ? "cross" : "morph");
        set(next);
      }),
    );

    // `catch` so a skipped/aborted transition still cleans up.
    vt.finished.catch(() => {}).finally(() => {
      root.classList.remove("photo-vt");
      busy.current = false;
      setSettled(true); // morph done: let the caption rise in
      // Now that the dialog is settled open, switch it to a cross name so the
      // next left/right step dissolves cleanly between two different photos.
      if (next !== null) setMode("cross");
      // Once fully closed, drop the name so no stray tile participates in an
      // unrelated transition (e.g. the theme toggle, which also uses View
      // Transitions).
      else setHero(null);
    });
  }

  return (
    <>
      <PhotoWall photos={photos} hero={hero} expanded={expanded} onOpen={go} />
      <PhotoLightbox
        photos={photos}
        index={expanded}
        settled={settled}
        mode={mode}
        onClose={() => go(null)}
        onNavigate={(i) => go(i)}
      />
    </>
  );
}
