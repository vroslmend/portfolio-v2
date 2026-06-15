import type { StaticImageData } from "next/image";
import p01 from "@/public/images/photos/PXL_20260514_125253198.webp";
import p02 from "@/public/images/photos/PXL_20260513_065651228.webp";
import p03 from "@/public/images/photos/PXL_20260510_112432357.webp";
import p04 from "@/public/images/photos/PXL_20260510_101038462.webp";
import p05 from "@/public/images/photos/PXL_20260510_071018356.webp";
import p06 from "@/public/images/photos/PXL_20260130_124359674.webp";
import p07 from "@/public/images/photos/PXL_20251102_080536939.webp";
import p08 from "@/public/images/photos/PXL_20251102_053359688.webp";
import p09 from "@/public/images/photos/PXL_20251101_023901995.webp";
import p10 from "@/public/images/photos/PXL_20240204_122021019.webp";

/**
 * A photo for the /photos wall. `src`/`width`/`height` satisfy react-photo-album's
 * layout; `image` is the full Next static import (carries blurDataURL) handed to
 * next/image. The optional fields show only in the expanded view.
 *
 * TODO (you): replace each `alt` with a real description of the shot, and add
 * `location` where you know it. `year` is pre-filled from the capture date.
 */
export type Photo = {
  src: string;
  width: number;
  height: number;
  image: StaticImageData;
  alt: string;
  title?: string;
  location?: string;
  year?: string;
};

type Meta = Pick<Photo, "alt" | "title" | "location" | "year">;

const photo = (image: StaticImageData, meta: Meta): Photo => ({
  src: image.src,
  width: image.width,
  height: image.height,
  image,
  ...meta,
});

export const photos: Photo[] = [
  photo(p01, { alt: "a photo i took", year: "2026" }),
  photo(p02, { alt: "a photo i took", year: "2026" }),
  photo(p03, { alt: "a photo i took", year: "2026" }),
  photo(p04, { alt: "a photo i took", year: "2026" }),
  photo(p05, { alt: "a photo i took", year: "2026" }),
  photo(p06, { alt: "a photo i took", year: "2026" }),
  photo(p07, { alt: "a photo i took", year: "2025" }),
  photo(p08, { alt: "a photo i took", year: "2025" }),
  photo(p09, { alt: "a photo i took", year: "2025" }),
  photo(p10, { alt: "a photo i took", year: "2024" }),
];
