"use client";

import Image from "next/image";
import {
  RowsPhotoAlbum,
  type RenderImageProps,
  type RenderImageContext,
} from "react-photo-album";
import "react-photo-album/rows.css";
import type { Photo } from "@/data/photos";

function renderPhoto(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext,
) {
  const p = photo as Photo;
  return (
    <div
      className="group/photo relative h-full w-full overflow-hidden rounded-sm bg-surface"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={p.image}
        alt={alt}
        title={title}
        fill
        sizes={sizes}
        placeholder="blur"
        quality={75}
        className="photo-img object-cover"
      />
    </div>
  );
}

export function PhotoWall({
  photos,
  onOpen,
}: {
  photos: Photo[];
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
      render={{ image: renderPhoto }}
    />
  );
}
