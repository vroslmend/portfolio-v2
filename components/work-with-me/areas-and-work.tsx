"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { WorkList } from "@/components/work/work-list";
import type { ClientService, Project } from "@/data/site";
import { hoverPaused, installHoverIntent } from "@/lib/hover-intent";

// Hover linking only on a real hover + fine-pointer device. Touch browsers
// emulate mouseenter on tap but don't reliably fire mouseleave, which would
// leave the page stuck half-dimmed (same reasoning as <Magnetic>).
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
function subscribe(onChange: () => void) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getFinePointer = () => window.matchMedia(FINE_POINTER).matches;
const getServerFinePointer = () => false;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="select-none font-mono text-[12px] uppercase tracking-[0.18em] text-faint">
      {children}
    </h2>
  );
}

/**
 * The five areas and the recent work that proves them. Hovering an area keeps
 * the projects behind it lit and dims the rest; hovering a project does the
 * reverse. The link is many-to-many, so no area is forced onto one example.
 * The list itself is the homepage work list, preview included.
 */
export function AreasAndWork({
  areas,
  work,
}: {
  areas: ClientService[];
  work: Project[];
}) {
  const finePointer = useSyncExternalStore(
    subscribe,
    getFinePointer,
    getServerFinePointer,
  );
  const [activeArea, setActiveArea] = useState<number | null>(null);
  const [activeWork, setActiveWork] = useState<string | null>(null);
  const reportWork = useCallback(
    (p: Project | null) => setActiveWork(p?.slug ?? null),
    [],
  );

  // Same rule as the list: scrolling under a resting cursor isn't a hover.
  useEffect(() => {
    installHoverIntent();
    const clear = () => setActiveArea(null);
    window.addEventListener("scroll", clear, { passive: true });
    return () => window.removeEventListener("scroll", clear);
  }, []);

  function hoverArea(i: number) {
    if (!finePointer || hoverPaused() || activeArea === i) return;
    setActiveArea(i);
  }

  const areaDimmed = (i: number) =>
    (activeArea !== null && activeArea !== i) ||
    (activeWork !== null && !areas[i].work.includes(activeWork));
  const workDimmed = (slug: string) =>
    (activeWork !== null && activeWork !== slug) ||
    (activeArea !== null && !areas[activeArea].work.includes(slug));

  return (
    <>
      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>what I can help with</SectionLabel>
        </Reveal>
        {/* Clearing on the container, not each row, so moving between rows
            hands the highlight straight across instead of flashing back. */}
        <div
          className="rows-hover flex flex-col"
          onMouseLeave={() => setActiveArea(null)}
        >
          {areas.map((area, i) => (
            <Reveal key={area.name} delay={i * 0.06}>
              <div
                onMouseEnter={() => hoverArea(i)}
                onMouseMove={() => hoverArea(i)}
                className={`grid gap-x-10 gap-y-3 border-t border-line py-7 transition-[border-color,opacity] duration-400 ease-out-expo hover:border-faint sm:grid-cols-[minmax(0,1fr)_2fr] ${areaDimmed(i) ? "opacity-35" : ""}`}
              >
                <h3 className="text-[15px] font-medium tracking-tight">
                  {area.name}
                </h3>
                <p className="max-w-[60ch] text-[14.5px] leading-[1.8] text-muted text-pretty">
                  {area.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <SectionLabel>recent work</SectionLabel>
            <Link
              href="/work"
              className="group font-mono text-[11px] tracking-[0.12em] text-muted transition-colors duration-300 hover:text-fg"
            >
              all work{" "}
              <span className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>
        <WorkList
          projects={work}
          dimmed={(p) => workDimmed(p.slug)}
          onActiveChange={finePointer ? reportWork : undefined}
        />
      </section>
    </>
  );
}
