"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/data/site";
import { HoverPreview } from "@/components/work/hover-preview";
import { hoverPaused, installHoverIntent } from "@/lib/hover-intent";
import { EASE } from "@/lib/motion";
import { usePreloadImages } from "@/lib/use-preload-images";

export function WorkList({
  projects,
  dimmed,
  onActiveChange,
}: {
  projects: Project[];
  /** Rows to dim from outside the list, for pages that link it to other content. */
  dimmed?: (project: Project) => boolean;
  /** Reports the hovered (or keyboard-focused) row back to those pages. */
  onActiveChange?: (project: Project | null) => void;
}) {
  const [active, setActive] = useState<Project | null>(null);
  const reduced = useReducedMotion();
  // Only focus that came from the keyboard is tracked, so the focus a mouse
  // click leaves behind never clears a hover highlight when it blurs.
  const keyboardFocus = useRef<string | null>(null);
  usePreloadImages(projects);

  // A row sliding under a resting cursor isn't a hover, so scrolling drops the
  // highlight and the preview. Keyboard focus stays, since tabbing scrolls too.
  useEffect(() => {
    installHoverIntent();
    const clear = () => {
      if (keyboardFocus.current) return;
      setActive(null);
      onActiveChange?.(null);
    };
    window.addEventListener("scroll", clear, { passive: true });
    return () => window.removeEventListener("scroll", clear);
  }, [onActiveChange]);

  function activate(project: Project | null) {
    setActive(project);
    onActiveChange?.(project);
  }

  // Runs on enter and on move, so a row the cursor is already resting on
  // picks up again as soon as the mouse moves after a scroll.
  function hover(project: Project) {
    if (hoverPaused() || active?.slug === project.slug) return;
    activate(project);
  }

  return (
    <div className="relative">
      <HoverPreview project={active} />
      {/* Hover is picked up per row but cleared on the list, so moving between
          rows hands the highlight straight across instead of flashing off. */}
      <ul
        className="work-list border-t border-line"
        onMouseLeave={() => activate(null)}
      >
        {projects.map((p, i) => (
          <li
            key={p.slug}
            onMouseEnter={() => hover(p)}
            onMouseMove={() => hover(p)}
            className={`work-row border-b border-line ${dimmed?.(p) ? "opacity-35" : ""}`}
          >
            {/* Entrance lives on an inner wrapper: the row itself keeps its
                CSS-driven hover dimming, which inline motion styles would fight. */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
            >
            <a
              href={p.links.live ?? p.links.github}
              target="_blank"
              rel="noreferrer"
              // keyboard focus reports the row too; the preview stays mouse-only
              // because it follows the cursor
              onFocus={(e) => {
                if (!onActiveChange || !e.currentTarget.matches(":focus-visible")) return;
                keyboardFocus.current = p.slug;
                onActiveChange(p);
              }}
              onBlur={() => {
                if (keyboardFocus.current !== p.slug) return;
                keyboardFocus.current = null;
                onActiveChange?.(null);
              }}
              className="group flex items-baseline gap-4 py-5"
            >
              {/* the number and arrow are decoration; screen readers get the
                  name, tagline and year */}
              <span
                aria-hidden="true"
                className="w-6 shrink-0 font-mono text-[11px] text-faint transition-colors duration-300 group-hover:text-fg"
              >
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
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-xs text-faint transition-[color,transform] duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
              >
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
