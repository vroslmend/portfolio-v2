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
          <h1 className="text-[15px] font-medium text-muted">
            hello — i&apos;m ammar.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="max-w-[58ch] text-[19px] leading-[1.7] text-fg text-pretty">
            I build things for the web that update{" "}
            <span className="accent-serif">while you&apos;re looking</span> at
            them — multiplayer games, realtime dashboards, and lately, products
            with AI <span className="accent-serif">thinking</span> inside.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            Software engineering student in Lahore. Last summer I worked on
            citizen-facing systems at Punjab Safe Cities Authority. You can
            look at{" "}
            <Link href="/work" className="p-link">
              my work
            </Link>
            , read{" "}
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
