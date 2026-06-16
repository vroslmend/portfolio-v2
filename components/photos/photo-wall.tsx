"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  RowsPhotoAlbum,
  type RenderImageProps,
  type RenderImageContext,
} from "react-photo-album";
import "react-photo-album/rows.css";
import { EASE } from "@/lib/motion";
import type { Photo } from "@/data/photos";

function makeRender(
  hero: number | null,
  expanded: number | null,
  reduced: boolean,
) {
  return function renderPhoto(
    { alt = "", title, sizes }: RenderImageProps,
    { photo, index, width, height }: RenderImageContext,
  ) {
    const p = photo as Photo;
    // The tile owns `photo-hero` only while it is the chosen photo AND not yet
    // expanded. Once the dialog opens it releases the name to the dialog image,
    // so exactly one element holds it at any moment.
    const named = hero === index && expanded !== index;
    // Stagger the tiles up on load in layout order (the album indexes tiles row
    // by row), capped so a large set never drags the cascade out too long.
    const delay = Math.min(index * 0.045, 0.5);
    return (
      <motion.div
        className="group/photo relative h-full w-full overflow-hidden rounded-sm bg-surface"
        style={{ aspectRatio: `${width} / ${height}` }}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.08 + delay }}
        onPointerEnter={() => {
          // Decode the full-size image on hover/touch-contact so opening lands
          // on a decoded image with no first-paint hang (mainly a Firefox win).
          const img = new window.Image();
          img.src = p.src;
          img.decode().catch(() => {});
        }}
      >
        <Image
          src={p.src}
          alt={alt}
          title={title}
          fill
          sizes={sizes}
          placeholder="blur"
          blurDataURL={p.blurDataURL}
          quality={75}
          // `is-hero` holds the active tile in colour so the morph stays
          // colour→colour; when it stops being the hero (close finishes) the
          // tile desaturates in place via the .photo-img filter transition.
          className={`photo-img object-cover${hero === index ? " is-hero" : ""}`}
          style={named ? { viewTransitionName: "photo-hero" } : undefined}
        />
      </motion.div>
    );
  };
}

export function PhotoWall({
  photos,
  hero,
  expanded,
  onOpen,
}: {
  photos: Photo[];
  hero: number | null;
  expanded: number | null;
  onOpen: (index: number) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <RowsPhotoAlbum
      photos={photos}
      // Below ~640px the justified rows collapse into a rigid 2-up grid with
      // every seam lined up. A target far taller than any single image forces
      // one image per row instead: a clean, image-forward single column.
      targetRowHeight={(containerWidth) =>
        containerWidth < 640 ? containerWidth * 3 : 200
      }
      spacing={8}
      defaultContainerWidth={720}
      onClick={({ index }) => onOpen(index)}
      sizes={{
        size: "720px",
        sizes: [{ viewport: "(max-width: 768px)", size: "calc(100vw - 48px)" }],
      }}
      render={{ image: makeRender(hero, expanded, reduced) }}
    />
  );
}
