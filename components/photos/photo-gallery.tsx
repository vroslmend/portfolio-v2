"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLenis } from "lenis/react";
import { PhotoWall } from "@/components/photos/photo-wall";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { preloadPhoto } from "@/lib/preload-photos";
import type { Photo } from "@/data/photos";

type ViewTransition = { finished: Promise<void> };
type Doc = Document & {
  startViewTransition?: (cb: () => void) => ViewTransition;
};

type Connection = { saveData?: boolean; effectiveType?: string };
type RIC = (cb: () => void, opts?: { timeout: number }) => number;

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
  // True while we're waiting for a destination image to decode before a step;
  // drives the quiet loading hint so the wait never looks like a frozen UI.
  const [loading, setLoading] = useState(false);
  // Each go() takes the next ticket; a later press/close bumps it so an earlier
  // op that is still awaiting its decode bails instead of swapping in late (the
  // old `busy` flag let a mid-load press jump to a not-yet-loaded image).
  const opSeq = useRef(0);
  // Serialize view transitions: starting one over a live one makes the browser
  // skip the first (a judder, worst in Firefox). Await the previous one first.
  const vtDone = useRef<Promise<void>>(Promise.resolve());

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

    const seq = ++opSeq.current;
    if (closing) setLoading(false); // a close cancels any pending step's spinner

    // Decode the destination BEFORE anything visible changes. The old code
    // started the transition (which swapped the caption) and only then waited up
    // to 500ms for a decode, so on a cold cache the title changed while the
    // picture stayed put.
    if (stepping) {
      // Stepping: hold the current photo (and its caption) until the next is
      // fully ready, with a quiet spinner over the wait. The timeout is only a
      // safety valve for a request that hangs open forever — a genuine load
      // error rejects decode() promptly, so an honest-but-slow image (poor
      // connection) still resolves on its real decode and the caption flips only
      // when the picture is actually there. Long, so slow links never flip early.
      setLoading(true);
      await preloadPhoto(photos[next!].src, 30000);
      if (opSeq.current !== seq) return; // a newer press/close took over
      setLoading(false);
    } else if (next !== null) {
      // Opening: keep it snappy — a short budget gives the morph real dimensions
      // (Firefox otherwise measures the unloaded image as tiny), then the image
      // fills in after the dialog is up rather than blocking the open on a cold
      // full-size download.
      await preloadPhoto(photos[next].src, 600);
      if (opSeq.current !== seq) return;
    }

    if (!doc.startViewTransition || reduced) {
      set(next);
      if (next !== null) setMode(stepping ? "cross" : "morph");
      setSettled(true);
      return;
    }

    // Don't stack transitions: wait out any in-flight morph, then re-check we're
    // still the latest op before committing.
    await vtDone.current.catch(() => {});
    if (opSeq.current !== seq) return;

    setSettled(false); // hide the caption; it fades back in after the morph

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
    // `catch` so a skipped/aborted transition still resolves the serializer.
    vtDone.current = vt.finished.catch(() => {});
    await vtDone.current;

    root.classList.remove("photo-vt");
    if (opSeq.current === seq) {
      setSettled(true); // morph done: let the caption rise in
      // Now that the dialog is settled open, switch it to a cross name so the
      // next left/right step dissolves cleanly between two different photos.
      if (next !== null) setMode("cross");
    }
    // Once fully closed, drop the name so no stray tile participates in an
    // unrelated transition (e.g. the theme toggle, which also uses View
    // Transitions).
    if (next === null) setHero(null);
  }

  // Idle-prefetch every full-resolution photo a moment after the wall mounts, so
  // stepping through the lightbox is instant from the first open — but ONLY on a
  // fast link. On a constrained connection bulk-loading 9 full images saturates
  // the pipe and starves the one photo the user is actually waiting on (which
  // defeats the wait-for-decode in go()). There the targeted neighbour-warm plus
  // wait-for-decode cover stepping without hogging bandwidth. Also honours the
  // data-saver hint. The lightbox stays correct on every link regardless.
  useEffect(() => {
    const conn = (navigator as { connection?: Connection }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && conn.effectiveType !== "4g") return;
    const run = () => {
      for (const p of photos) void preloadPhoto(p.src).catch(() => {});
    };
    const ric = (window as unknown as { requestIdleCallback?: RIC })
      .requestIdleCallback;
    if (ric) {
      const id = ric(run, { timeout: 3000 });
      return () =>
        (
          window as unknown as { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 1500);
    return () => window.clearTimeout(t);
  }, [photos]);

  return (
    <>
      <PhotoWall photos={photos} hero={hero} expanded={expanded} onOpen={go} />
      <PhotoLightbox
        photos={photos}
        index={expanded}
        settled={settled}
        mode={mode}
        loading={loading}
        onClose={() => go(null)}
        onNavigate={(i) => go(i)}
      />
    </>
  );
}
