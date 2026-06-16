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

// `title` and `location` are guesses from the photos themselves (all in
// Pakistan) — fix any that are wrong. They render lowercase in the quiet mono
// caption; `alt` is a plain full-sentence description for screen readers.
/** @type {Entry[]} */
export const manifest = [
  // landscape
  {
    file: "PXL_20260514_125253198",
    title: "the road back",
    location: "shigar, skardu",
    alt: "The road back to Skardu from Shigar, winding between bare rocky mountains, shot through a car windscreen with snow on the far peaks and power lines following the road.",
  },
  // portrait
  {
    file: "PXL_20260510_071018356",
    title: "the trail to beyal",
    location: "fairy meadows",
    alt: "A narrow dirt trail climbing a forested slope of tall pines on the way up to Beyal Camp, with a snow capped peak showing through the trees.",
  },
  // landscape
  {
    file: "PXL_20260510_112432357",
    title: "nanga parbat, clear morning",
    location: "somewhere near beyal camp",
    alt: "The snow covered face of Nanga Parbat under a clear blue sky, seen from just past Beyal Camp, above dark rocky ridges.",
  },
  // landscape
  {
    file: "PXL_20260510_101038462",
    title: "clouds coming over",
    location: "below german point",
    alt: "Snow covered peaks of the Nanga Parbat massif under broken cloud, from a viewpoint above Beyal Camp, with bare trees scattered across the slope below.",
  },
  // portrait
  {
    file: "PXL_20251101_023901995",
    title: "hills from the back seat",
    location: "galiyat",
    alt: "Layered blue hills fading into haze, seen through the open rear window of a car.",
  },
  // landscape
  {
    file: "PXL_20260130_124359674",
    title: "marshmallows",
    location: "lahore",
    alt: "A pink and grey dappled sunset over apartment buildings and a parking lot lined with palm trees.",
  },
  // landscape
  {
    file: "PXL_20251102_080536939",
    title: "man in a ray",
    location: "nathia gali",
    alt: "A forest track leading up to the old red church at Nathia Gali, with a man walking it alone in the early light.",
  },
  // portrait
  {
    file: "PXL_20240204_122021019",
    title: "the tractor",
    location: "gujranwala",
    alt: "A silver Mitsubishi Galant parked on a quiet residential street, under a tree whose trunk is painted white.",
  },
  // landscape
  {
    file: "PXL_20251102_053359688",
    title: "the wrong way up",
    location: "mushkpuri",
    alt: "A lone pine on a grassy ridge top, looking out over rows of blue forested hills fading into haze.",
  },
];
