"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
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
      onClose={onClose}
      onClick={(e) => {
        // a click landing on the dialog element itself is the backdrop
        if (e.target === ref.current) onClose();
      }}
      className="photo-dialog"
    >
      {photo && (
        <figure className="m-0 flex flex-col items-center gap-3">
          <Image
            src={photo.image}
            alt={photo.alt}
            sizes="(max-width: 1200px) 100vw, 1200px"
            quality={75}
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
      )}
    </dialog>
  );
}
