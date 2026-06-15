"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { PhotoWall } from "@/components/photos/photo-wall";
import type { Photo } from "@/data/photos";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  // wired to the lightbox in a later task; kept here so the open handler is stable
  void expanded;
  return (
    <Reveal delay={0.18}>
      <PhotoWall photos={photos} onOpen={setExpanded} />
    </Reveal>
  );
}
