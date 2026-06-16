"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  MasonryPhotoAlbum,
  type RenderImageProps,
  type RenderImageContext,
} from "react-photo-album";
import "react-photo-album/masonry.css";
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
    <MasonryPhotoAlbum
      photos={photos}
      // Masonry instead of justified rows: each photo keeps its own size and
      // stacks into columns, so the bottoms stagger and the rigid cell grid is
      // gone (a looser, scattered wall). One column below ~640px keeps the
      // clean image-forward single column on phones; three on desktop.
      columns={(containerWidth) => (containerWidth < 640 ? 1 : 3)}
      // Tight gutters on desktop read as one hung wall; the single mobile column
      // gets more air so each full-width photo lands on its own.
      spacing={(containerWidth) => (containerWidth < 640 ? 16 : 8)}
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
