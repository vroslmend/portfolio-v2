"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "motion/react";
import type { Project } from "@/data/site";
import { Reveal } from "@/components/reveal";
import { EASE } from "@/lib/motion";
import { usePreloadImages } from "@/lib/use-preload-images";

const arrowClass =
  "inline-block transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5";

/**
 * A single screenshot living in the margin to the right of the column. It
 * glides vertically to whichever featured row is hovered and crossfades the
 * image between projects, so it reads as one object following your attention
 * rather than a separate preview per row. Margin-only: hidden below xl, width
 * clamped so it can never overlap the column or overflow the viewport.
 */
function FeaturedPreview({
  project,
  y,
  reduced,
}: {
  project: Project | null;
  y: MotionValue<number>;
  reduced: boolean | null;
}) {
  const { resolvedTheme } = useTheme();
  const src =
    project &&
    (resolvedTheme === "light" && project.imageLight
      ? project.imageLight
      : project.image);

  return (
    <motion.div
      aria-hidden
      style={{ y }}
      className="pointer-events-none absolute left-[calc(100%+3rem)] top-0 z-40 hidden w-[min(340px,calc((100vw-48rem)/2-5rem))] xl:block"
    >
      {/* shift up half its own (fixed) height so the glide centres it on the
          row. A locked aspect-ratio stage with the images stacked absolutely
          means a crossfade never changes the box size, so nothing lurches. */}
      <div className="-translate-y-1/2">
        <div className="relative aspect-[640/340] w-full">
          <AnimatePresence>
            {project && src && (
              <motion.div
                key={project.slug}
                className="absolute inset-0 overflow-hidden rounded-md border border-line bg-surface shadow-[0_24px_60px_-20px_var(--shadow-dialog)]"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="340px"
                  loading="eager"
                  unoptimized
                  className="preview-img object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedList({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();
  usePreloadImages(projects);

  // the preview glides to the vertical centre of whichever row is hovered
  const targetY = useMotionValue(0);
  const smoothY = useSpring(targetY, { stiffness: 280, damping: 32, mass: 0.6 });
  const y = reduced ? targetY : smoothY;

  // A row's bottom line is the next row's top border, so hover state has to
  // brighten both edges of the hovered row from here, not via CSS hover.
  function topBorder(i: number) {
    return active === i || active === i - 1 ? "border-t-faint" : "border-t-line";
  }

  return (
    <section
      className="relative flex flex-col"
      onMouseLeave={() => setActive(null)}
    >
      <FeaturedPreview
        project={active === null ? null : projects[active]}
        y={y}
        reduced={reduced}
      />
      {projects.map((p, i) => (
        <Reveal key={p.slug} delay={i * 0.05}>
          <article
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              const center = el.offsetTop + el.offsetHeight / 2;
              // appearing from rest: drop it in place; between rows: glide
              if (active === null) smoothY.jump(center);
              targetY.set(center);
              setActive(i);
            }}
            className={`relative grid gap-x-10 gap-y-3 border-t py-10 transition-colors duration-500 sm:grid-cols-[1fr_2fr] ${topBorder(i)} ${
              i === projects.length - 1
                ? `border-b ${active === i ? "border-b-faint" : "border-b-line"}`
                : ""
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-[17px] font-medium tracking-tight">
                  {p.name}
                </h2>
              </div>
              <p className="pl-6.5 font-mono text-[11px] tracking-[0.08em] text-faint sm:pl-0 sm:pt-1">
                {p.tagline} · {p.year}
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <p className="max-w-[60ch] text-[14.5px] leading-[1.8] text-muted text-pretty">
                {p.description}
              </p>
              <p className="select-none font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {p.stack.join(" · ")}
              </p>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                {p.links.live && (
                  <a
                    href={p.links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="u-link group font-mono text-[11px] tracking-[0.12em] text-fg"
                  >
                    live <span className={arrowClass}>↗</span>
                  </a>
                )}
                {p.links.github && (
                  <a
                    href={p.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="u-link group font-mono text-[11px] tracking-[0.12em] text-fg"
                  >
                    github <span className={arrowClass}>↗</span>
                  </a>
                )}
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </section>
  );
}
