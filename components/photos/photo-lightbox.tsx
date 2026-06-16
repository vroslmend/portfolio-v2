"use client";

import { useEffect, useRef } from "react";
import type { Photo } from "@/data/photos";

export function PhotoLightbox({
  photos,
  index,
  settled,
  mode,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  index: number | null;
  settled: boolean;
  mode: "morph" | "cross";
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const photo = index === null ? null : photos[index];
  const prev =
    index === null ? 0 : (index - 1 + photos.length) % photos.length;
  const next = index === null ? 0 : (index + 1) % photos.length;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") onNavigate((index! + 1) % photos.length);
      if (e.key === "ArrowLeft")
        onNavigate((index! - 1 + photos.length) % photos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onNavigate]);

  // Decode the neighbours ahead of time so a left/right step never pays the
  // full-size decode on the morph frame (Firefox decodes on the main thread and
  // visibly hangs the first time otherwise). `.decode()`, not just `.src`, is
  // the point: downloading isn't enough, it has to be decoded before paint.
  useEffect(() => {
    if (index === null) return;
    for (const i of [next, prev]) {
      const img = new window.Image();
      img.src = photos[i].image.src;
      img.decode().catch(() => {});
    }
  }, [index, prev, next, photos]);

  return (
    <dialog
      ref={ref}
      aria-label="photo viewer"
      onCancel={(e) => {
        // Esc: keep the native dialog open and route the close through the
        // parent's single view transition. Letting it auto-close fires the
        // `close` event, which would re-enter and skip the morph.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // a click landing on the dialog element itself is the backdrop
        if (e.target === ref.current) onClose();
      }}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start || index === null) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        // a deliberate horizontal swipe (not a tap, not a vertical drag)
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
        onNavigate(dx < 0 ? next : prev);
      }}
      className="photo-dialog"
    >
      {photo && (
        <>
          {/* the dim/blur as a real element so it can carry its own
              view-transition-name and fade in/out in sync with the morph
              (the native ::backdrop is top-layer and can't be transitioned) */}
          <div className="photo-scrim" aria-hidden="true" />

          <button
            type="button"
            className="photo-nav photo-nav--prev"
            aria-label="previous photo"
            onClick={() => onNavigate(prev)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="photo-nav photo-nav--next"
            aria-label="next photo"
            onClick={() => onNavigate(next)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <figure className="relative m-0 flex flex-col items-center gap-3">
          {/* a plain <img> of the full static webp (not next/image): the
              gallery decodes this exact URL before the morph so the image's
              dimensions are known when the transition snapshots it. Without it
              Firefox measures the not-yet-loaded image as tiny and the open
              morph animates to a ~50px image before popping to full size. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.image.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            decoding="async"
            // `photo-hero` (shared with the tile) for the open/close morph; an
            // alternating non-shared name for steps so they dissolve in place
            // rather than morphing one photo's box into the next.
            style={{
              viewTransitionName:
                mode === "cross" && index !== null
                  ? `photo-cross-${index % 2}`
                  : "photo-hero",
            }}
            className="max-h-[82dvh] w-auto rounded-sm object-contain"
          />
          {(photo.title || photo.location || photo.year) && (
            <figcaption
              className={`photo-caption${settled ? " is-settled" : ""} select-none font-mono text-[11px] tracking-[0.08em] text-faint`}
            >
              {[
                photo.title,
                [photo.location, photo.year].filter(Boolean).join(" · "),
              ]
                .filter(Boolean)
                .join("  ·  ")}
            </figcaption>
          )}
          </figure>
        </>
      )}
    </dialog>
  );
}
