"use client";

import { useEffect, useRef, useState } from "react";
import { warmPhoto } from "@/lib/preload-photos";
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
  loading,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  index: number | null;
  settled: boolean;
  mode: "morph" | "cross";
  loading: boolean;
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
    if (index !== null && !dialog.open) {
      dialog.showModal();
      // showModal() auto-focuses the first focusable child (the prev chevron),
      // and since arrow/swipe nav is handled at the window level focus never
      // leaves it, so Chrome leaves a :focus-visible ring stuck on the left
      // arrow. Move focus to the dialog itself: the controls stay reachable by
      // Tab (ring shows then, correctly) without one being pinned on open.
      dialog.focus();
    }
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
  // full-size decode on the morph frame. `warmPhoto` holds a strong reference in
  // the shared cache, so the request can't be GC-cancelled before it finishes
  // (a detached Image() can be), and the decoded frame stays warm for the step.
  useEffect(() => {
    if (index === null) return;
    warmPhoto(photos[next].src);
    warmPhoto(photos[prev].src);
  }, [index, prev, next, photos]);

  const displayDate = photo ? formatDate(photo.date) : undefined;
  // Caption pieces as discrete segments so they wrap as whole units (each stays
  // on one line; the date drops cleanly to the next line, centred, when space is
  // tight) instead of breaking mid-phrase like one long string did.
  const capSegs = photo
    ? [photo.title, photo.location, displayDate].filter(Boolean)
    : [];
  // The main caption (title + location · date) stays under the image. The
  // togglable panel is the EXIF spec sheet only — location/date are NOT repeated.
  const specRows: [string, string][] = photo
    ? ([
        ["aperture", photo.aperture],
        ["shutter", photo.shutter],
        ["iso", photo.iso != null ? `ISO ${photo.iso}` : undefined],
        ["focal", photo.focal],
        ["camera", photo.camera],
      ].filter(([, v]) => v) as [string, string][])
    : [];
  // the toggle only appears when there's a spec sheet beyond the plain caption
  const hasExif = specRows.length > 0;

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
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

          {/* quiet loading hint while the next full-res photo is still decoding
              on a cold cache; the current photo stays put underneath until it's
              ready. Hidden by default; .is-loading fades it in (see globals). */}
          <div
            className={`photo-spinner${loading ? " is-loading" : ""}`}
            role="status"
            aria-label="loading photo"
            aria-hidden={!loading}
          />


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

          {/* The stage keeps the image as the only in-flow element so it never
              shifts when the panel toggles. The metadata block is positioned out
              of flow: a bottom panel on phones/tablets (room below the width-
              constrained image) and a fixed-width rail in the right margin on
              desktop (room beside a full-height image). See .photo-stage /
              .photo-meta in globals.css. */}
          <figure className="photo-stage relative m-0">
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
          {/* Main caption: title + location · date, always directly under the
              image (centred). Constant height, in normal flow, so the image
              never shifts. The ⓘ toggle sits with it and flips to a close (×). */}
          {(capSegs.length > 0 || hasExif) && (
            <figcaption
              className={`photo-cap photo-caption${settled ? " is-settled" : ""} select-none font-mono text-[11px] tracking-[0.08em] text-faint`}
            >
              {capSegs.map((seg, i) => (
                <span key={i} className="photo-cap-seg">
                  {/* the · rides with the segment it precedes (nowrap), so a
                      wrap leaves no dangling dot at the end of the line above */}
                  {i > 0 && (
                    <span className="photo-cap-sep" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {seg}
                </span>
              ))}
              {hasExif && (
                <button
                  type="button"
                  className="photo-info-btn"
                  aria-label={details ? "hide shooting info" : "shooting info"}
                  aria-expanded={details}
                  aria-controls="photo-spec-panel"
                  onClick={() => setDetails((d) => !d)}
                >
                  {details ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M7 7l10 10M17 7L7 17" />
                    </svg>
                  ) : (
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
                  )}
                </button>
              )}
            </figcaption>
          )}
          {/* The shooting-info spec sheet. Positioned OUT of flow (so the image
              is untouched): a rail in the right margin on desktop, a panel below
              the caption on phones/tablets. Height animates via grid-rows. */}
          {hasExif && (
            <div
              id="photo-spec-panel"
              className={`photo-extra${details ? " is-open" : ""}`}
            >
              <div className="photo-extra-inner select-none font-mono text-[11px] tracking-[0.08em] text-faint">
                <dl className="photo-details">
                  {specRows.map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
          </figure>
        </>
      )}
    </dialog>
  );
}
