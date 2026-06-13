import { useEffect } from "react";
import type { Project } from "@/data/site";

/**
 * Warm the browser cache for the project preview screenshots a moment after
 * mount, so the hover preview paints instantly instead of fetching on first
 * hover. The images are static and `unoptimized`, so a plain Image() request
 * hits the exact same URL the <Image> will use and is served from cache.
 */
export function usePreloadImages(projects: Project[]) {
  useEffect(() => {
    const srcs = projects.flatMap((p) =>
      [p.image, p.imageLight].filter((s): s is string => Boolean(s))
    );
    if (srcs.length === 0) return;

    // hold off briefly so this never competes with the initial render
    const id = setTimeout(() => {
      for (const src of srcs) {
        const img = new window.Image();
        img.src = src;
      }
    }, 300);
    return () => clearTimeout(id);
  }, [projects]);
}
