"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLenis } from "lenis/react";
import { PhotoWall } from "@/components/photos/photo-wall";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { lightboxSrc, preloadPhoto, warmPhoto } from "@/lib/preload-photos";
import type { Photo } from "@/data/photos";

type ViewTransition = { finished: Promise<void> };
type Doc = Document & {
  startViewTransition?: (cb: () => void) => ViewTransition;
};

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
  // non-shared, alternating name, so the two frames of a step land in separate
  // transition groups and the outgoing one can be handed over to the incoming
  // one rather than morphing one box into the other (which, with differing
  // aspect ratios, looked like an awkward vertical collapse).
  const [mode, setMode] = useState<"morph" | "cross">("morph");
  // Which of the two alternating `photo-cross-*` names the dialog image wears.
  // It has to flip on every step so the outgoing and incoming frames land in
  // separate transition groups, which is what lets them be sequenced rather
  // than cross-faded (see .photo-vt-step in globals.css). Driven by a toggle
  // rather than `index % 2`: with an odd number of photos the parity repeats
  // across the wrap (8 -> 0), which quietly turned that one step into a
  // shared-name morph animating by completely different rules.
  const [slot, setSlot] = useState(0);
  // True from the moment a move commits until that photo's <img> reports it has
  // arrived. Drives the quiet loading hint, so a wait never looks like frozen UI
  // — including on open, which previously showed no indicator at all.
  const [loading, setLoading] = useState(false);
  // Each go() takes the next ticket; a later press/close bumps it so an earlier
  // op that is still awaiting its decode bails instead of swapping in late (the
  // old `busy` flag let a mid-load press jump to a not-yet-loaded image).
  const opSeq = useRef(0);
  // Serialize view transitions: starting one over a live one makes the browser
  // skip the first (a judder, worst in Firefox). Await the previous one first.
  const vtDone = useRef<Promise<void>>(Promise.resolve());
  // Where the newest move is headed, which is not `expanded` while a transition
  // is in flight: the browser takes its own beat to capture the old snapshot
  // before the callback commits the state change. A relative press landing in
  // that window used to be resolved against the still-rendered index, so it
  // repeated the previous target and stepped a photo to itself — a dissolve
  // that visibly went nowhere and ate the press.
  const pending = useRef<number | null>(null);

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

  // Arrows and swipes are relative, so they must count from the newest target
  // rather than from what is currently painted (see `pending`). Presses during
  // a transition then queue up properly: the serializer lets the last one win,
  // and it lands on the right photo instead of re-running the previous step.
  function step(delta: number) {
    const base = pending.current ?? expanded;
    if (base === null) return;
    go((base + delta + photos.length) % photos.length);
  }

  async function go(next: number | null) {
    const doc = document as Doc;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const opening = expanded === null && next !== null;
    const closing = next === null;
    const stepping = expanded !== null && next !== null;

    const seq = ++opSeq.current;
    pending.current = next;
    if (closing) setLoading(false); // a close cancels any pending step's spinner

    if (next !== null) {
      // The spinner is armed for every move, not just steps. Its CSS fade-in is
      // delayed, so an already-decoded photo clears `loading` on the img's own
      // load event long before the ring can appear; only a real wait shows one.
      setLoading(true);
    }

    if (stepping) {
      // Deliberately NOT awaited. Stepping used to block on decode with a 30s
      // ceiling, so on a cold cache the arrows appeared dead — the press was
      // queued behind a decode, which is also why it stalled on a fast
      // connection. Now the step commits immediately and the photo streams in
      // behind its own blur placeholder.
      warmPhoto(lightboxSrc(photos[next!]));
    } else if (next !== null) {
      // Opening still takes a short budget: the morph wants real dimensions, and
      // Firefox otherwise measures a not-yet-loaded image as tiny and animates
      // to a ~50px box before popping to full size. Short enough that a cold
      // cache never holds the dialog shut.
      await preloadPhoto(lightboxSrc(photos[next]), 400);
      if (opSeq.current !== seq) return;
    }

    if (!doc.startViewTransition || reduced) {
      set(next);
      if (next !== null) setMode(stepping ? "cross" : "morph");
      else setHero(null);
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
    // On close, the transition copy fades into an identical underlay retained
    // in the wall. That reveals the fixed header already present in the final
    // root snapshot; no separately rasterized header snapshot is involved.
    root.classList.toggle("photo-vt-close", closing);
    root.classList.toggle("photo-vt-step", stepping);

    const vt = doc.startViewTransition(() =>
      flushSync(() => {
        setMode(stepping ? "cross" : "morph");
        if (stepping) setSlot((s) => 1 - s);
        set(next);
      }),
    );
    // `catch` so a skipped/aborted transition still resolves the serializer.
    vtDone.current = vt.finished.catch(() => {});
    await vtDone.current;

    root.classList.remove("photo-vt", "photo-vt-close", "photo-vt-step");
    if (opSeq.current === seq) {
      setSettled(true); // morph done: let the caption rise in
      // Now that the dialog is settled open, switch it to a cross name so the
      // next left/right step hands over cleanly between two different photos.
      if (next !== null) setMode("cross");
    }
    // Once fully closed, drop the name so no stray tile participates in an
    // unrelated transition (e.g. the theme toggle, which also uses View
    // Transitions).
    if (next === null) setHero(null);
  }

  // NOTE: there used to be an idle prefetch of every full-resolution photo here.
  // It was the cause of the slowness rather than a cure for it: nine 4.3 MP
  // images held as decoded bitmaps is ~148 MB resident, which on a phone means
  // memory pressure, eviction, and a decode queue that navigation then waited
  // on. The targeted neighbour warm above, against a correctly-sized URL and a
  // bounded cache, covers stepping without any of that.

  return (
    <>
      <PhotoWall photos={photos} hero={hero} expanded={expanded} onOpen={go} />
      <PhotoLightbox
        photos={photos}
        index={expanded}
        settled={settled}
        mode={mode}
        slot={slot}
        loading={loading}
        onClose={() => go(null)}
        onStep={step}
        onLoaded={() => setLoading(false)}
      />
    </>
  );
}
