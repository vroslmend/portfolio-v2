"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { EASE } from "@/lib/motion";
import { useKitty } from "@/components/kitty/kitty-provider";

export function KittyInlineLauncher() {
  const { enabled, open, revealed, settled, wide, openKitty } = useKitty();
  const reduced = useReducedMotion();

  if (!enabled) return null;

  return (
    <>
      <span className="kitty-reveal-anchor" data-kitty-reveal aria-hidden="true" />
      {!wide && (
        <motion.button
          type="button"
          className="kitty-inline-launcher"
          aria-label="open kitty"
          aria-expanded={open}
          onClick={(event) => openKitty(event.currentTarget)}
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
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
