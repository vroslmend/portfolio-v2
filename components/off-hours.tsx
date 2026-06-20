"use client";

import { useState } from "react";
import { PriusTrigger } from "@/components/prius-trigger";
import { Reveal } from "@/components/reveal";
import { NowListening } from "@/components/now-listening";

export function OffHours() {
  const [open, setOpen] = useState(false);

  return (
    <Reveal delay={0.12}>
      <div className="group grid gap-x-10 gap-y-2 border-y border-line py-6 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint transition-colors duration-500 group-hover:text-muted">
          off hours
        </span>
        <div className="max-w-[58ch]">
          <p className="text-[15px] leading-[1.8] text-muted text-pretty">
            Mostly video games with friends,{" "}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="cursor-pointer border-b border-dashed border-faint transition-colors duration-300 hover:border-fg"
            >
              some music going
            </button>
            . Otherwise a lot of padel I&apos;ve never gotten good at, some
            cycling, and pretending the next new coffee place will be worth it.
            Forever defending the <PriusTrigger /> as the best car ever.
          </p>

          <div className={`listening-panel${open ? " is-open" : ""}`}>
            <div className="listening-panel-inner pt-5">
              <NowListening />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
