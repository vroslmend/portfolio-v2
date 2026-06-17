// Shared full-resolution photo preloader for the /photos lightbox.
//
// The wall renders small `next/image` thumbnails; the lightbox shows the full
// ~2400px raw webp at a different URL, so browsing the wall never warms it. This
// module fetches + decodes those full images and KEEPS A STRONG REFERENCE to
// each one, which matters for two reasons:
//   1. A detached Image() with no reference can be garbage-collected mid-flight,
//      which cancels its download — so a "preload" could silently never finish.
//   2. Holding the decoded element keeps the frame warm, so when the live <img>
//      mounts with the same src it paints without a fresh decode.
//
// `preloadPhoto` resolves once the image is decoded (or after a safety timeout,
// so a broken/dead URL can never wedge navigation). Callers can await it before
// committing a view transition to guarantee the destination is ready first.

const cache = new Map<string, HTMLImageElement>();

const isReady = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

/** Decode `src` (reusing/holding a cached Image). Resolves when ready, or after
 *  `timeoutMs` as a safety valve. Idempotent and warm on repeat calls. */
export function preloadPhoto(src: string, timeoutMs = 12000): Promise<void> {
  let img = cache.get(src);
  if (img && isReady(img)) return Promise.resolve();
  if (!img) {
    img = new window.Image();
    img.decoding = "async";
    img.src = src;
    cache.set(src, img);
  }
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

/** Fire-and-forget warm of a src (used on hover / for neighbours). */
export function warmPhoto(src: string): void {
  void preloadPhoto(src).catch(() => {});
}
