export const KITTY_ART_IDS = [
  "7574338",
  "8273687",
  "8273689",
  "8273706",
  "8317982",
] as const;

export type KittyArtId = (typeof KITTY_ART_IDS)[number];

export const FOOTER_KITTY_ART_ID: KittyArtId = "8317982";

type KittyArtEntry = {
  image: HTMLImageElement;
  promise: Promise<boolean>;
  ready: boolean;
};

const cache = new Map<KittyArtId, KittyArtEntry>();

export function kittyArtSrc(id: KittyArtId) {
  return `/kitty/cat-${id}.svg`;
}

export function isKittyArtReady(id: KittyArtId) {
  return cache.get(id)?.ready ?? false;
}

/**
 * Fetch, decode, and retain a kitty pose before it participates in motion.
 * Keeping the detached image referenced avoids throwing away decoded artwork
 * between infrequent state changes.
 */
export function preloadKittyArt(id: KittyArtId): Promise<boolean> {
  const cached = cache.get(id);
  if (cached) return cached.promise;
  if (typeof window === "undefined") return Promise.resolve(false);

  const image = new window.Image();
  image.decoding = "async";

  const entry: KittyArtEntry = {
    image,
    ready: false,
    promise: Promise.resolve(false),
  };

  entry.promise = new Promise<boolean>((resolve) => {
    let finished = false;

    const cleanup = () => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
    };

    const finish = async (loaded: boolean) => {
      if (finished) return;
      finished = true;
      cleanup();

      if (loaded) {
        try {
          await image.decode();
        } catch {
          // A completed SVG can still paint when decode() is unsupported or
          // rejects, so naturalWidth remains the final readiness check.
        }
      }

      entry.ready = loaded && image.naturalWidth > 0;
      resolve(entry.ready);
    };

    const onLoad = () => void finish(true);
    const onError = () => void finish(false);

    image.addEventListener("load", onLoad, { once: true });
    image.addEventListener("error", onError, { once: true });
    image.src = kittyArtSrc(id);

    if (image.complete) void finish(image.naturalWidth > 0);
  });

  cache.set(id, entry);
  return entry.promise;
}

export function preloadAllKittyArt() {
  return Promise.all(KITTY_ART_IDS.map(preloadKittyArt));
}
