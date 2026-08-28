"use client";

import { useEffect, useRef, useState } from "react";
import { lightboxSrc, warmPhoto } from "@/lib/preload-photos";
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
  stepPhase,
  loading,
  onClose,
  onStep,
  onLoaded,
}: {
  photos: Photo[];
  index: number | null;
  settled: boolean;
  stepPhase: "idle" | "out" | "swap" | "in";
  loading: boolean;
  onClose: () => void;
  /** move by ±1 — relative, so a press mid-transition still counts (see gallery) */
  onStep: (delta: number) => void;
  /** the photo finished arriving (or failed) — clears the loading hint */
  onLoaded: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  // The expanded "shooting info" panel. Persists across nav while the dialog
  // stays mounted; collapsed again whenever the lightbox closes (index → null),
  // reset in render so it's clean on the next open without a setState-in-effect.
  const [details, setDetails] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [seen, setSeen] = useState(index);
  if (index !== seen) {
    setSeen(index);
    if (index === null) setDetails(false);
  }
  const photo = index === null ? null : photos[index];
  const src = photo ? lightboxSrc(photo) : null;
  const imageReady = src !== null && loadedSrc === src;
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
      if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
      else if (e.key === "i" || e.key === "I") setDetails((d) => !d);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onStep]);

  // Decode the neighbours ahead of time so a left/right step never pays the
  // full-size decode on the morph frame. `warmPhoto` holds a strong reference in
  // the shared cache, so the request can't be GC-cancelled before it finishes
  // (a detached Image() can be), and the decoded frame stays warm for the step.
  useEffect(() => {
    if (index === null) return;
    warmPhoto(lightboxSrc(photos[next]));
    warmPhoto(lightboxSrc(photos[prev]));
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
        onStep(dx < 0 ? 1 : -1);
      }}
      className="photo-dialog"
    >
      {photo && (
        <>
          {/* the dim/blur as a real element so it can carry its own
              view-transition-name and fade in/out in sync with the morph
              (the native ::backdrop is top-layer and can't be transitioned) */}
          <div className="photo-scrim" aria-hidden="true" />

          {/* quiet loading hint while the optimized photo is still arriving on
              a cold cache. Its blur placeholder is already visible underneath.
              Hidden by default; .is-loading fades it in (see globals). */}
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
            onClick={() => onStep(-1)}
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
            onClick={() => onStep(1)}
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
          {/* A plain <img> rather than next/image, but pointed at the optimiser
              rather than at the raw file: the gallery warms this exact URL
              before the morph so the image's dimensions are known when the
              transition snapshots it, and next/image's own srcset would make
              "this exact URL" unknowable. Without the match Firefox measures a
              not-yet-loaded image as tiny and animates to a ~50px box before
              popping to full size.

              The raw file is a 2400px long edge — about four times the pixels a
              phone can show, decoded in full and then thrown away. lightboxSrc
              asks for the box it actually occupies at quality 90, which is
              sharper than the old file at 82 and a quarter of the decode.

              blurDataURL sits behind it as the background, so a photo that is
              still arriving shows its own blur at the right size instead of an
              empty box with a caption floating in the middle of it. */}
          <div
            className="photo-image-frame"
            style={{
              viewTransitionName: "photo-hero",
              backgroundImage: `url("${photo.blurDataURL}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              aspectRatio: `${photo.width} / ${photo.height}`,
              // `aspect-ratio` cannot reserve space while both CSS dimensions
              // are auto. Give the image its final responsive width up front so
              // the blur and the view-transition target never begin at 0×0.
              width: `min(1200px, 92vw, ${82 * (photo.width / photo.height)}dvh)`,
            }}
          >
            {/* A key forces a fresh DOM image for every photo. The browser
                cannot retain the old request over the new blur placeholder. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={src}
              src={src ?? undefined}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              decoding="async"
              onLoad={() => {
                setLoadedSrc(src);
                onLoaded();
              }}
              onError={onLoaded}
              className={`photo-lightbox-image photo-step-${stepPhase}${imageReady ? " is-ready" : ""}`}
            />
          </div>
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
