"use client";

import { useState } from "react";
import type { Project } from "@/data/site";
import { HoverPreview } from "@/components/work/hover-preview";

export function WorkList({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <div className="relative">
      <HoverPreview project={active} />
      <ul className="work-list border-t border-line">
        {projects.map((p, i) => (
          <li key={p.slug} className="work-row border-b border-line">
            <a
              href={p.links.live ?? p.links.github}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => setActive(p)}
              onMouseLeave={() => setActive(null)}
              className="group flex items-baseline gap-4 py-5"
            >
              <span className="w-6 shrink-0 font-mono text-[11px] text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[17px] font-medium tracking-tight text-fg transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                {p.name}
              </span>
              <span className="hidden flex-1 truncate text-sm text-muted sm:inline">
                {p.tagline}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-faint">
                {p.year}
              </span>
              <span className="shrink-0 font-mono text-xs text-faint transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
