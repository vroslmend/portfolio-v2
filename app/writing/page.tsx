import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "writing · ammar hassan",
  description: "Occasional writing on systems, AI, and building things.",
};

const pieces = [
  {
    slug: "now-playing",
    title: "Putting my Spotify on the page, without overdoing it",
    tagline: "a build note",
    date: "june 2026 · 4 min",
  },
  {
    slug: "visitor-counter",
    title: "A visitor counter, taken too seriously",
    tagline: "a build note",
    date: "june 2026 · 6 min",
  },
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
                className="group flex items-baseline justify-between gap-x-6 py-5"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[17px] font-medium tracking-tight text-fg transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                    {p.title}
                  </span>
                  <span className="text-sm text-faint transition-colors duration-300 group-hover:text-muted">
                    {p.tagline}
                  </span>
                </span>
                <span className="flex shrink-0 items-baseline gap-3">
                  <span className="font-mono text-[11px] text-faint transition-colors duration-300 group-hover:text-muted">
                    {p.date}
                  </span>
                  <span className="font-mono text-xs text-faint transition-[color,transform] duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:text-fg">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
