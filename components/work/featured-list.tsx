"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { Project } from "@/data/site";
import { Reveal } from "@/components/reveal";
import { EASE } from "@/lib/motion";

const arrowClass =
  "inline-block transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5";

/**
 * Screenshot popping up beside its own row, in the margin to the right of
 * the content column. Absolutely positioned to the article, so it scrolls
 * with the row it belongs to. Margin-only: hidden below xl, width clamped
 * so it can never overlap the column or overflow the viewport.
 */
function RowPreview({ project, show }: { project: Project; show: boolean }) {
  if (!project.image) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[calc(100%+3rem)] top-1/2 z-40 hidden w-[min(300px,calc((100vw-48rem)/2-5rem))] xl:block"
          initial={{ opacity: 0, x: 14, y: "-50%" }}
          animate={{ opacity: 1, x: 0, y: "-50%" }}
          exit={{ opacity: 0, x: 8, y: "-50%" }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="overflow-hidden rounded-md border border-line bg-surface shadow-[0_24px_60px_-20px_var(--shadow-dialog)]">
            <Image
              src={project.image}
              alt=""
              width={640}
              height={340}
              loading="eager"
              unoptimized
              className="block h-auto w-full saturate-[0.85]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FeaturedList({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<number | null>(null);

  // A row's bottom line is the next row's top border, so hover state has to
  // brighten both edges of the hovered row from here, not via CSS hover.
  function topBorder(i: number) {
    return active === i || active === i - 1 ? "border-t-faint" : "border-t-line";
  }

  return (
    <section className="flex flex-col">
      {projects.map((p, i) => (
        <Reveal key={p.slug} delay={i * 0.05}>
          <article
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`relative grid gap-x-10 gap-y-3 border-t py-10 transition-colors duration-500 sm:grid-cols-[1fr_2fr] ${topBorder(i)} ${
              i === projects.length - 1
                ? `border-b ${active === i ? "border-b-faint" : "border-b-line"}`
                : ""
            }`}
          >
            <RowPreview project={p} show={active === i} />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-[17px] font-medium tracking-tight">
                  {p.name}
                </h2>
              </div>
              <p className="pl-[26px] font-mono text-[11px] tracking-[0.08em] text-faint sm:pl-0 sm:pt-1">
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
