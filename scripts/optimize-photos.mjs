import { readdir, mkdir, access } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

// Convert raw originals dropped in _resources/seed-images-for-photo-wall/ into
// web-ready .webp in public/images/photos/. _resources is gitignored (originals
// stay out of the repo); the webp output is committed and static-imported by
// data/photos.ts. Next handles responsive delivery from there, so this just
// caps the source size — it's repo hygiene, not the delivery pipeline.
const SRC = "_resources/seed-images-for-photo-wall";
const OUT = "public/images/photos";
const MAX = 2400; // long-edge cap

try {
  await access(SRC);
} catch {
  console.error(`No source folder at ${SRC}/ — create it and add images.`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

// recurse, so an extracted subfolder of images still gets picked up
const files = (await readdir(SRC, { recursive: true })).filter((f) =>
  /\.(jpe?g|png|webp|tiff?)$/i.test(f),
);

if (files.length === 0) {
  console.log(`No images in ${SRC}/ yet — drop some in and re-run \`npm run photos\`.`);
  process.exit(0);
}

let n = 0;
for (const file of files.sort()) {
  const { name } = parse(file);
  const out = join(OUT, `${name}.webp`);
  await sharp(join(SRC, file))
    .rotate() // bake in EXIF orientation so portraits aren't sideways
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`✓ ${file} → ${out}`);
  n++;
}
console.log(`\nDone. ${n} image${n === 1 ? "" : "s"} → ${OUT}/`);
