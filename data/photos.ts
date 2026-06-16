import generated from "@/data/photos.generated.json";
import { manifest } from "@/data/photos.manifest.mjs";

/** Settings read automatically from each photo's EXIF (see optimize-photos.mjs). */
export type ExifMeta = {
  camera?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  focal?: string;
  date?: string; // ISO YYYY-MM-DD; formatted for display in the component
};

/** Everything the build script derives for one photo (data/photos.generated.json). */
type Generated = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
} & ExifMeta;

/** A photo on the wall: generated data + the hand-typed human fields. */
export type Photo = Generated & {
  alt: string;
  location?: string;
  title?: string;
};

const gen = generated as Record<string, Generated>;

// The list lives in data/photos.manifest.mjs (read by the build script too, so it
// can gatekeep which files are built/kept). Here we just merge each line with its
// generated data; the hand-typed fields win. A listed file with no generated
// data means the script hasn't been run for it.
export const photos: Photo[] = manifest.map(({ file, ...meta }) => {
  const g = gen[file];
  if (!g) {
    throw new Error(
      `photos: no generated data for "${file}" — run \`npm run photos\``,
    );
  }
  return { ...g, ...meta };
});
