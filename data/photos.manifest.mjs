// THE photo list — hand-edited, the single source of truth for the wall.
//
// This file is the gatekeeper: `npm run photos` builds a webp + generated data
// ONLY for the files listed here, and prunes any stray webp that isn't. So you
// can drop a whole messy backup folder (Pixel, WhatsApp, other phones) into
// _resources/seed-images-for-photo-wall/ and only the frames you list below ever
// ship. `public/images/photos/` always mirrors this list.
//
//   add a photo:    drop the original in the seed folder, add a line here with
//                   its base name, run `npm run photos`
//   remove a photo: delete its line, run `npm run photos` (its webp is pruned)
//   reorder:        move the line (order here = wall order)
//   edit alt/place: just edit the line — no rebuild needed (only new IMAGES need
//                   `npm run photos`; alt/location/title are read live at build)
//
// `file` is the source base name (the part before the first dot, so Google's
// `PXL_….PORTRAIT.ORIGINAL.jpg` is just `PXL_…`). It's also the webp/EXIF key.
//
// The set is intentionally all Pixel 5 so the "all shot on a Pixel 5" copy stays
// true — the lone Pixel 8a frame and the re-shared WhatsApp image are simply not
// listed (and so never built). Order interleaves landscape/portrait so the
// justified rows get mixed widths and the seams don't line up into a grid.

/** @typedef {{ file: string; alt: string; location?: string; title?: string }} Entry */

/** @type {Entry[]} */
export const manifest = [
  { file: "PXL_20260514_125253198", alt: "a photo i took", location: "" }, // landscape
  { file: "PXL_20260510_071018356", alt: "a photo i took", location: "" }, // portrait
  { file: "PXL_20260510_112432357", alt: "a photo i took", location: "" }, // landscape
  { file: "PXL_20260510_101038462", alt: "a photo i took", location: "" }, // landscape
  { file: "PXL_20251101_023901995", alt: "a photo i took", location: "" }, // portrait
  { file: "PXL_20260130_124359674", alt: "a photo i took", location: "" }, // landscape
  { file: "PXL_20251102_080536939", alt: "a photo i took", location: "" }, // landscape
  { file: "PXL_20240204_122021019", alt: "a photo i took", location: "" }, // portrait
  { file: "PXL_20251102_053359688", alt: "a photo i took", location: "" }, // landscape
];
