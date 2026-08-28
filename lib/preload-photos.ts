// Shared full-resolution photo preloader for the /photos lightbox.
//
// The wall renders small `next/image` thumbnails; the lightbox shows a much
// larger frame at a different URL, so browsing the wall never warms it. This
// module fetches + decodes those images and holds a reference to each, which
// matters for two reasons:
//   1. A detached Image() with no reference can be garbage-collected mid-flight,
//      which cancels its download — so a "preload" could silently never finish.
//   2. Holding the decoded element keeps the frame warm, so when the live <img>
//      mounts with the same src it paints without a fresh decode.
//
// The cache is BOUNDED, and that is the whole point of the rewrite. It used to
// hold every image it ever decoded, forever, while the gallery idle-prefetched
// all of them on mount. Nine 2400x1800 photos is 4.3 megapixels each, and a
// decoded bitmap is 4 bytes per pixel: ~16 MB apiece, ~148 MB resident. On a
// phone that means memory pressure, eviction (so the "warm" cache often wasn't),
// and a decode queue that navigation was then waiting on — slow on a fast
// connection, because the bottleneck was never the network.

const MAX_CACHED = 5; // current + both neighbours, with room to spare
const cache = new Map<string, HTMLImageElement>();

const isReady = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

/** Mark `src` most-recently-used and drop the oldest beyond the cap. Map
 *  iterates in insertion order, so re-inserting is what moves an entry to the
 *  back of the queue. Dropped entries are unreferenced and their bitmaps become
 *  collectable; nothing is cancelled, since a completed image is just data. */
function touch(src: string, img: HTMLImageElement) {
  cache.delete(src);
  cache.set(src, img);
  while (cache.size > MAX_CACHED) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/** Decode `src` (reusing/holding a cached Image). Resolves when ready, or after
 *  `timeoutMs` as a safety valve. Idempotent and warm on repeat calls. */
export function preloadPhoto(src: string, timeoutMs = 12000): Promise<void> {
  let img = cache.get(src);
  if (img && isReady(img)) {
    touch(src, img);
    return Promise.resolve();
  }
  if (!img) {
    img = new window.Image();
    img.decoding = "async";
    img.src = src;
  }
  touch(src, img);
  const el = img;
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    el.decode().then(finish, finish);
    window.setTimeout(finish, timeoutMs);
  });
}

/** Fire-and-forget warm of a src (used for lightbox neighbours). */
export function warmPhoto(src: string): void {
  void preloadPhoto(src).catch(() => {});
}

// Next's image optimiser only answers for widths it has been configured with;
// anything else is a 400. These are the framework defaults (next.config.ts sets
// no `deviceSizes`), so the pick has to snap up to one of them.
const WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

/**
 * The URL the lightbox should actually load.
 *
 * The lightbox used to point straight at the raw file in public/ — a 2400px
 * long edge at quality 82 — which bypasses the optimiser entirely. On a phone
 * that is roughly four times more pixels than the screen can physically show,
 * downloaded and decoded in full and then thrown away on the downscale.
 *
 * Sizing it to the box it actually occupies is therefore not a quality
 * compromise, it is the opposite: quality is the `q` parameter, and this asks
 * for 90 against the wall's 75. Fewer pixels at a higher quality setting is
 * sharper than more pixels at a lower one, because the browser is no longer
 * doing the downscale itself.
 *
 * The device-pixel-ratio cap at 2 is deliberate. A DPR-3 phone gains nothing
 * visible on a photograph at this size and pays 2.25x the decode for it.
 */
export function lightboxSrc(
  photo: { src: string; width: number; height: number },
  quality = 90,
): string {
  if (typeof window === "undefined") return photo.src;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Mirrors the CSS: max-height 82dvh, max-width 1200px / 92vw.
  const boxH = window.innerHeight * 0.82;
  const boxW = Math.min(
    1200,
    window.innerWidth * 0.92,
    boxH * (photo.width / photo.height),
  );
  const want = Math.ceil(boxW * dpr);
  const w = WIDTHS.find((s) => s >= want) ?? WIDTHS[WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(photo.src)}&w=${w}&q=${quality}`;
}
