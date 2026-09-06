import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";

export type EssayFlowStep = {
  label: string;
  note: string;
  emphasis?: boolean;
};

export function EssayHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5">
      <Reveal mask>
        <p className="select-none font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="max-w-[24ch] text-[26px] font-medium leading-[1.25] tracking-tight text-fg sm:text-[32px]">
          {title}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="max-w-[58ch] text-pretty text-[15px] leading-[1.8] text-muted">
          {children}
        </p>
      </Reveal>
    </header>
  );
}

export function EssaySection({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="flex items-baseline gap-3 text-[16px] font-medium tracking-tight">
          <span className="select-none font-mono text-[11px] text-faint">
            {n}
          </span>
          {title}
        </h2>
        <div className="flex flex-col gap-4 text-[15px] leading-[1.8] text-muted">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

export function EssayFigure({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="select-none py-3">
      {children}
      <figcaption className="pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

export function LinearFlow({
  steps,
  caption,
  label,
}: {
  steps: EssayFlowStep[];
  caption: string;
  label: string;
}) {
  return (
    <EssayFigure caption={caption}>
      <ol className="flex flex-col" aria-label={label}>
        {steps.map((step) => (
          <li
            key={step.label}
            className="relative grid gap-x-4 gap-y-0.5 border-l border-line pb-6 pl-6 last:border-transparent last:pb-1 sm:grid-cols-[9rem_1fr]"
          >
            <span
              aria-hidden
              className={`absolute -left-[4px] top-[9px] size-[7px] rounded-full ${
                step.emphasis ? "bg-fg" : "border border-faint bg-bg"
              }`}
            />
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                step.emphasis ? "font-medium text-fg" : "text-muted"
              }`}
            >
              {step.label}
            </span>
            <span className="text-[13px] text-faint">{step.note}</span>
          </li>
        ))}
      </ol>
    </EssayFigure>
  );
}

export function EssayFooter() {
  return (
    <Reveal>
      <footer className="border-t border-line pt-6">
        <Link
          href="/writing"
          className="u-link font-mono text-[11px] tracking-[0.12em] text-muted hover:text-fg"
        >
          ← all writing
        </Link>
      </footer>
    </Reveal>
  );
}
