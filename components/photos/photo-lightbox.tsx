"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/data/photos";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "2026-05-14" → "14 May 2026"; passes through anything it can't parse.
function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

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
  // The expanded "shooting info" panel. Persists across nav while the dialog
  // stays mounted; collapsed again whenever the lightbox closes (index → null),
  // reset in render so it's clean on the next open without a setState-in-effect.
  const [details, setDetails] = useState(false);
  const [seen, setSeen] = useState(index);
  if (index !== seen) {
    setSeen(index);
    if (index === null) setDetails(false);
  }
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
      else if (e.key === "ArrowLeft")
        onNavigate((index! - 1 + photos.length) % photos.length);
      else if (e.key === "i" || e.key === "I") setDetails((d) => !d);
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
      img.src = photos[i].src;
      img.decode().catch(() => {});
    }
  }, [index, prev, next, photos]);

  const displayDate = photo ? formatDate(photo.date) : undefined;
  // rows shown in the expanded grid, in order, skipping anything missing
  const detailRows: [string, string][] = photo
    ? ([
        ["location", photo.location],
        ["date", displayDate],
        ["aperture", photo.aperture],
        ["shutter", photo.shutter],
        ["iso", photo.iso != null ? `ISO ${photo.iso}` : undefined],
        ["focal", photo.focal],
        ["camera", photo.camera],
      ].filter(([, v]) => v) as [string, string][])
    : [];
  // the ⓘ only appears when there's a spec sheet beyond the plain caption
  const hasExif = !!(
    photo &&
    (photo.aperture || photo.shutter || photo.iso != null || photo.focal || photo.camera)
  );

  return (
    <dialog
      ref={ref}
      aria-label="photo viewer"
      onCancel={(e) => {
        // Esc is two-stage: close the details panel first if it's open. Either
        // way keep the native dialog open and route the close through the
        // parent's single view transition. Letting it auto-close fires the
        // `close` event, which would re-enter and skip the morph.
        e.preventDefault();
        if (details) setDetails(false);
        else onClose();
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
            src={photo.src}
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
          {(photo.title || photo.location || displayDate || hasExif) && (
            <figcaption
              className={`photo-caption${settled ? " is-settled" : ""} select-none font-mono text-[11px] tracking-[0.08em] text-faint`}
            >
              {/* Two collapsible rows, exactly one open at a time. Animating
                  their height (grid-rows 0fr→1fr) instead of swapping outright
                  means the caption grows/shrinks smoothly, so the centered image
                  glides rather than snapping up when the panel opens. */}
              <div className={`photo-cap-collapse${details ? "" : " is-open"}`}>
                <div className="flex items-center justify-center gap-2">
                  <span>
                    {[
                      photo.title,
                      [photo.location, displayDate].filter(Boolean).join(" · "),
                    ]
                      .filter(Boolean)
                      .join("  ·  ")}
                  </span>
                </div>
              </div>
              <div className={`photo-cap-collapse${details ? " is-open" : ""}`}>
                <dl className="photo-details">
                  {detailRows.map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {hasExif && (
                <div className="mt-1.5 flex justify-center">
                  <button
                    type="button"
                    className="photo-info-btn"
                    aria-label="photo details"
                    aria-expanded={details}
                    onClick={() => setDetails((d) => !d)}
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
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 11v5" />
                      <path d="M12 8h.01" />
                    </svg>
                  </button>
                </div>
              )}
            </figcaption>
          )}
          </figure>
        </>
      )}
    </dialog>
  );
}
