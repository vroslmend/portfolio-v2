"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/data/site";
import { HoverPreview } from "@/components/work/hover-preview";
import { EASE } from "@/lib/motion";
import { usePreloadImages } from "@/lib/use-preload-images";

export function WorkList({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);
  const reduced = useReducedMotion();
  usePreloadImages(projects);

  return (
    <div className="relative">
      <HoverPreview project={active} />
      <ul className="work-list border-t border-line">
        {projects.map((p, i) => (
          <li key={p.slug} className="work-row border-b border-line">
            {/* Entrance lives on an inner wrapper: the row itself keeps its
                CSS-driven hover dimming, which inline motion styles would fight. */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
            >
            <a
              href={p.links.live ?? p.links.github}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => setActive(p)}
              onMouseLeave={() => setActive(null)}
              className="group flex items-baseline gap-4 py-5"
            >
              <span className="w-6 shrink-0 font-mono text-[11px] text-faint transition-colors duration-300 group-hover:text-fg">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[17px] font-medium tracking-tight text-fg transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                {p.name}
              </span>
              <span className="hidden flex-1 truncate text-sm text-faint transition-colors duration-300 group-hover:text-muted sm:inline">
                {p.tagline}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-faint transition-colors duration-300 group-hover:text-muted">
                {p.year}
              </span>
              <span className="shrink-0 font-mono text-xs text-faint transition-[color,transform] duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg">
                ↗
              </span>
            </a>
            </motion.div>
          </li>
        ))}
      </ul>
    </div>
  );
}
