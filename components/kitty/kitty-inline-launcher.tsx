"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { EASE } from "@/lib/motion";
import { useKitty } from "@/components/kitty/kitty-provider";

export function KittyInlineLauncher() {
  const { enabled, open, settled, wide, openKitty, revealKitty } = useKitty();
  const reduced = useReducedMotion();
  const anchor = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = anchor.current;
    if (!enabled || !element || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        revealKitty(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -30% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, inView, revealKitty]);

  if (!enabled) return null;

  return (
    <>
      <span ref={anchor} className="kitty-reveal-anchor" aria-hidden="true" />
      {!wide && (
        <motion.button
          type="button"
          className="kitty-inline-launcher"
          aria-label="open kitty"
          aria-expanded={open}
          onClick={(event) => openKitty(event.currentTarget)}
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: reduced ? 0 : 0.72, ease: EASE }}
        >
          <span className="kitty-inline-label">
            {settled || reduced ? "ask about the work" : "hey, down here."}
          </span>
          <Image
            src="/kitty/cat-8317982.svg"
            alt=""
            width={100}
            height={100}
            unoptimized
            className="kitty-art"
          />
        </motion.button>
      )}
    </>
  );
}
