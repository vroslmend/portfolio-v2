import Link from "next/link";
import { Drift } from "@/components/drift";
import { NameReveal } from "@/components/name-reveal";
import { Reveal } from "@/components/reveal";
import { WorkList } from "@/components/work/work-list";
import { projects, site } from "@/data/site";

export default function Home() {
  const featured = projects.filter((p) => p.featured);

  return (
    <div className="flex flex-col gap-24 pb-8">
      <Drift>
        <section className="flex flex-col gap-7">
          <Reveal mask>
            <p className="font-mono text-[12px] tracking-[0.12em] text-muted">
              hello, i&apos;m
            </p>
          </Reveal>
          <NameReveal
            text="ammar hassan"
            delay={0.12}
            className="text-[38px] font-medium leading-[1.15] tracking-tight text-fg sm:text-[48px]"
          />
          <Reveal delay={0.18}>
            <p className="max-w-[58ch] text-[19px] leading-[1.7] text-fg text-pretty">
              I design and build for the web from Lahore. I care about how
              things work, how they look - and lately, whether they can{" "}
              <span className="accent-serif">think</span>.
            </p>
          </Reveal>
          <Reveal delay={0.28}>
            <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
              Right now I&apos;m in my final year, spending my free time on side
              projects and slowly working my way into AI engineering. Have a
              look at{" "}
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
      </Drift>

      <section className="flex flex-col gap-6">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <h2 className="select-none font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              selected work
            </h2>
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
        <WorkList projects={featured} />
      </section>

      <section>
        <Reveal>
          <p className="font-mono text-[12px] leading-relaxed tracking-[0.04em] text-faint">
            <span className="text-muted">now</span> — {site.now}.{" "}
            <span className="whitespace-nowrap opacity-60">· jun 2026</span>
          </p>
        </Reveal>
      </section>
    </div>
  );
}
