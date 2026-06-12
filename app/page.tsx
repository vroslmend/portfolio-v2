import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { WorkList } from "@/components/work/work-list";
import { projects, site } from "@/data/site";

export default function Home() {
  const featured = projects.filter((p) => p.featured);

  return (
    <div className="flex flex-col gap-24 pb-8">
      <section className="flex flex-col gap-7">
        <Reveal mask>
          <p className="font-mono text-[12px] tracking-[0.12em] text-muted">
            hello, i&apos;m
          </p>
        </Reveal>
        <Reveal mask delay={0.08}>
          <h1 className="text-[38px] font-medium leading-[1.1] tracking-tight text-fg sm:text-[48px]">
            ammar hassan<span className="text-faint">.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="max-w-[58ch] text-[19px] leading-[1.7] text-fg text-pretty">
            A software engineering student in Lahore who spends most of his
            time building for the web: multiplayer games, tools for my
            university, and a few things that{" "}
            <span className="accent-serif">people actually use</span>.
          </p>
        </Reveal>
        <Reveal delay={0.28}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            Right now I&apos;m in my final year, spending my free time on side
            projects and slowly going deeper into AI. Have a look at{" "}
            <Link href="/work" className="p-link">
              my work
            </Link>
            , read a bit{" "}
            <Link href="/about" className="p-link">
              about me
            </Link>
            , or just{" "}
            <a href={`mailto:${site.email}`} className="p-link">
              say hello
            </a>
            .
          </p>
        </Reveal>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              selected work
            </h2>
            <Link
              href="/work"
              className="u-link font-mono text-[11px] tracking-[0.12em] text-muted hover:text-fg"
            >
              all work →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <WorkList projects={featured} />
        </Reveal>
      </section>

      <section>
        <Reveal>
          <p className="font-mono text-[12px] leading-relaxed tracking-[0.04em] text-faint">
            <span className="text-muted">now</span> — {site.now}.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
