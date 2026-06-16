"use client";

import { useEffect, useRef } from "react";
import type { Photo } from "@/data/photos";

export function PhotoLightbox({
  photos,
  index,
  onClose,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const photo = index === null ? null : photos[index];

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

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
      className="photo-dialog"
    >
      {photo && (
        <>
          {/* the dim/blur as a real element so it can carry its own
              view-transition-name and fade in/out in sync with the morph
              (the native ::backdrop is top-layer and can't be transitioned) */}
          <div className="photo-scrim" aria-hidden="true" />
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
            style={{ viewTransitionName: "photo-hero" }}
            className="max-h-[82vh] w-auto rounded-sm object-contain"
          />
          {(photo.title || photo.location || photo.year) && (
            <figcaption className="select-none font-mono text-[11px] tracking-[0.08em] text-faint">
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
