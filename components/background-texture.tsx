"use client";

import { useEffect, useState } from "react";
import { DitherBackground } from "@/components/dither-background";

type Texture = "film" | "dither";

const STORAGE_KEY = "portfolio-background-texture";

export function BackgroundTexture() {
  const [texture, setTexture] = useState<Texture>("film");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let saved: Texture = "film";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "film" || stored === "dither") saved = stored;
    } catch {
      // Storage can be unavailable in hardened/private browser contexts.
    }

    // Read persistence after hydration without making the server and first
    // client render disagree. One frame is imperceptible for this review tool.
    const frame = requestAnimationFrame(() => {
      setTexture(saved);
      setHydrated(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    document.documentElement.dataset.texture = texture;
    try {
      window.localStorage.setItem(STORAGE_KEY, texture);
    } catch {
      // The comparison still works for this page load without persistence.
    }

    return () => {
      delete document.documentElement.dataset.texture;
    };
  }, [hydrated, texture]);

  return (
    <>
      {texture === "dither" && <DitherBackground />}

      <div
        role="group"
        aria-label="background texture"
        className="fixed right-4 bottom-4 z-[70] flex items-center gap-1 rounded-full border border-line bg-bg/80 p-1 font-mono text-[10px] tracking-[0.08em] text-faint shadow-sm backdrop-blur-md"
      >
        {(["film", "dither"] as const).map((option) => {
          const active = texture === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setTexture(option)}
              className={`rounded-full px-2.5 py-1.5 transition-colors duration-200 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg ${
                active ? "bg-fg text-bg" : "hover:text-fg"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </>
  );
}
