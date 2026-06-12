"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import type { Project } from "@/data/site";
import { EASE } from "@/lib/motion";

const emptySubscribe = () => () => {};

/** Cursor-following screenshot preview for the work list (fine pointers only). */
export function HoverPreview({ project }: { project: Project | null }) {
  const finePointer = useSyncExternalStore(
    emptySubscribe,
    () => window.matchMedia("(pointer: fine)").matches,
    () => false
  );
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.5 });

  useEffect(() => {
    if (!finePointer) return;
    function onMove(e: MouseEvent) {
      x.set(e.clientX + 24);
      y.set(e.clientY - 90);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [finePointer, x, y]);

  if (!finePointer) return null;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key={project.slug}
          style={{ x: sx, y: sy }}
          className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <div className="w-[300px] overflow-hidden rounded-md border border-line bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
            {project.image ? (
              <Image
                src={project.image}
                alt=""
                width={600}
                height={375}
                className="aspect-[16/10] w-full object-cover saturate-[0.85]"
              />
            ) : (
              <div className="grid aspect-[16/10] w-full place-items-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  {project.tagline}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
