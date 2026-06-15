"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { PhotoWall } from "@/components/photos/photo-wall";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import type { Photo } from "@/data/photos";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <>
      <Reveal delay={0.18}>
        <PhotoWall photos={photos} onOpen={setExpanded} />
      </Reveal>
      <PhotoLightbox
        photos={photos}
        index={expanded}
        onClose={() => setExpanded(null)}
      />
    </>
  );
}
