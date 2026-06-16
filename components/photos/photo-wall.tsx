"use client";

import Image from "next/image";
import {
  RowsPhotoAlbum,
  type RenderImageProps,
  type RenderImageContext,
} from "react-photo-album";
import "react-photo-album/rows.css";
import type { Photo } from "@/data/photos";

function makeRender(hero: number | null, expanded: number | null) {
  return function renderPhoto(
    { alt = "", title, sizes }: RenderImageProps,
    { photo, index, width, height }: RenderImageContext,
  ) {
    const p = photo as Photo;
    // The tile owns `photo-hero` only while it is the chosen photo AND not yet
    // expanded. Once the dialog opens it releases the name to the dialog image,
    // so exactly one element holds it at any moment.
    const named = hero === index && expanded !== index;
    return (
      <div
        className="group/photo relative h-full w-full overflow-hidden rounded-sm bg-surface"
        style={{ aspectRatio: `${width} / ${height}` }}
        onMouseEnter={() => {
          // Decode the full-size image on hover so clicking opens straight into
          // a decoded image with no first-paint hang (mainly a Firefox win).
          const img = new window.Image();
          img.src = p.image.src;
          img.decode().catch(() => {});
        }}
      >
        <Image
          src={p.image}
          alt={alt}
          title={title}
          fill
          sizes={sizes}
          placeholder="blur"
          quality={75}
          // `is-hero` holds the active tile in colour so the morph stays
          // colour→colour; when it stops being the hero (close finishes) the
          // tile desaturates in place via the .photo-img filter transition.
          className={`photo-img object-cover${hero === index ? " is-hero" : ""}`}
          style={named ? { viewTransitionName: "photo-hero" } : undefined}
        />
      </div>
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
  return (
    <RowsPhotoAlbum
      photos={photos}
      targetRowHeight={200}
      spacing={8}
      defaultContainerWidth={720}
      onClick={({ index }) => onOpen(index)}
      sizes={{
        size: "720px",
        sizes: [{ viewport: "(max-width: 768px)", size: "calc(100vw - 48px)" }],
      }}
      render={{ image: makeRender(hero, expanded) }}
    />
  );
}
