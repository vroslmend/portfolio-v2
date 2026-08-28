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
type StepPhase = "idle" | "out" | "swap" | "in";

const STEP_OUT_MS = 110;
const STEP_IN_MS = 180;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  // Which tile owns the shared `photo-hero` name for the open/close morph.
  const [hero, setHero] = useState<number | null>(null);
  const [settled, setSettled] = useState(true);
  // Steps stay local to the bitmap: old image -> blur, keyed node/blur swap,
  // then new image -> opaque. Document View Transitions are open/close only.
  const [stepPhase, setStepPhase] = useState<StepPhase>("idle");
  const [loading, setLoading] = useState(false);

  // Opening can wait briefly for decode and can be superseded by closing.
  const opSeq = useRef(0);
  // Open/close morphs remain serialized; local stepping waits for one to finish.
  const vtDone = useRef<Promise<void>>(Promise.resolve());
  // `expanded` is actually mounted; `pending` is the newest relative target.
  const expandedRef = useRef<number | null>(null);
  const pending = useRef<number | null>(null);
  const stepRunning = useRef(false);
  const closeAfterStep = useRef(false);

  // Lock the page behind the native modal while keeping Lenis in control.
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    if (expanded !== null) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [lenis, expanded]);

  function set(next: number | null) {
    expandedRef.current = next;
    if (next !== null) setHero(next);
    setExpanded(next);
  }

  function step(delta: number) {
    if (closeAfterStep.current) return;
    const base = pending.current ?? expandedRef.current;
    if (base === null || photos.length < 2) return;

    const next = (base + delta + photos.length) % photos.length;
    pending.current = next;
    warmPhoto(lightboxSrc(photos[next]));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLoading(true);
      set(next);
      setSettled(true);
      return;
    }

    void runSteps();
  }

  async function runSteps() {
    if (stepRunning.current) return;
    stepRunning.current = true;

    // Never run a local fade inside the opening shared-element morph.
    await vtDone.current.catch(() => {});
    setSettled(false);

    while (
      pending.current !== null &&
      expandedRef.current !== null &&
      pending.current !== expandedRef.current
    ) {
      setStepPhase("out");
      await wait(STEP_OUT_MS);

      // Read at the handoff point so rapid presses retain their final target
      // without rendering every intermediate photo.
      const next = pending.current;
      if (next === null || expandedRef.current === null) break;

      setLoading(true);
      flushSync(() => {
        setStepPhase("swap");
        set(next);
      });

      // Ensure the keyed image and new blur paint at zero opacity first.
      await nextPaint();
      setStepPhase("in");
      await wait(STEP_IN_MS);
    }

    setStepPhase("idle");
    setSettled(true);
    stepRunning.current = false;

    if (closeAfterStep.current) {
      closeAfterStep.current = false;
      void go(null);
    } else if (pending.current !== expandedRef.current) {
      // Covers a press arriving as the previous loop released its flag.
      void runSteps();
    }
  }

  function close() {
    if (stepRunning.current) {
      closeAfterStep.current = true;
      return;
    }
    void go(null);
  }

  // The document-scoped transition is reserved for wall-tile <-> dialog morphs.
  async function go(next: number | null) {
    const doc = document as Doc;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const opening = expanded === null && next !== null;
    const closing = next === null;

    const seq = ++opSeq.current;
    pending.current = next;
    if (closing) setLoading(false);
    if (next !== null) {
      setLoading(true);
      // A short budget gives the hero morph real pixels when they are nearby,
      // without holding a cold-cache open interaction for a full download.
      await preloadPhoto(lightboxSrc(photos[next]), 400);
      if (opSeq.current !== seq) return;
    }

    if (!doc.startViewTransition || reduced) {
      set(next);
      if (next === null) setHero(null);
      setSettled(true);
      return;
    }

    await vtDone.current.catch(() => {});
    if (opSeq.current !== seq) return;

    setSettled(false);
    // The old snapshot must see the selected wall tile carrying the shared name.
    if (opening) flushSync(() => setHero(next));

    const root = document.documentElement;
    root.classList.add("photo-vt");
    root.classList.toggle("photo-vt-close", closing);

    const vt = doc.startViewTransition(() => flushSync(() => set(next)));
    vtDone.current = vt.finished.catch(() => {});
    await vtDone.current;

    root.classList.remove("photo-vt", "photo-vt-close");
    if (opSeq.current === seq) setSettled(true);
    if (next === null) setHero(null);
  }

  return (
    <>
      <PhotoWall photos={photos} hero={hero} expanded={expanded} onOpen={go} />
      <PhotoLightbox
        photos={photos}
        index={expanded}
        settled={settled}
        stepPhase={stepPhase}
        loading={loading}
        onClose={close}
        onStep={step}
        onLoaded={() => setLoading(false)}
      />
    </>
  );
}
