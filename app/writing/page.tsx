import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "writing — ammar hassan",
  description: "Occasional writing on systems, AI, and building things.",
};

const pieces = [
  {
    slug: "agentic-bookkeeping",
    title: "Agents that do bookkeeping, with humans where it matters",
    tagline: "an architecture concept",
    date: "may 2026 · 6 min",
  },
];

export default function WritingPage() {
  return (
    <div className="flex flex-col gap-12 pb-8">
      <Reveal mask>
        <h1 className="text-[15px] font-medium text-muted">
          occasional writing, hopefully.
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <ul className="border-t border-line">
          {pieces.map((p) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                href={`/writing/${p.slug}`}
                className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-5"
              >
                <span className="text-[17px] font-medium tracking-tight text-fg transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                  {p.title}
                </span>
                <span className="hidden text-sm text-faint transition-colors duration-300 group-hover:text-muted sm:inline">
                  {p.tagline}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-faint transition-colors duration-300 group-hover:text-muted">
                  {p.date}
                </span>
                <span className="shrink-0 font-mono text-xs text-faint transition-[color,transform] duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:text-fg">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
