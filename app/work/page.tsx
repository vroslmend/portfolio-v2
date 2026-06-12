import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { WorkList } from "@/components/work/work-list";
import { projects } from "@/data/site";

export const metadata: Metadata = {
  title: "work — ammar hassan",
};

export default function WorkPage() {
  const featured = projects.filter((p) => p.featured);
  const smaller = projects.filter((p) => !p.featured);

  return (
    <div className="flex flex-col gap-20 pb-8">
      <Reveal mask>
        <h1 className="text-[15px] font-medium text-muted">
          a selection of things i&apos;ve built over the last few years.
        </h1>
      </Reveal>

      <section className="flex flex-col">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05}>
            <article
              className={`grid gap-x-10 gap-y-3 border-t border-line py-10 sm:grid-cols-[1fr_2fr] ${
                i === featured.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-[17px] font-medium tracking-tight">
                    {p.name}
                  </h2>
                </div>
                <p className="pl-[26px] font-mono text-[11px] tracking-[0.08em] text-faint sm:pl-0 sm:pt-1">
                  {p.tagline} · {p.year}
                </p>
              </div>
              <div className="flex flex-col gap-5">
                <p className="max-w-[60ch] text-[14.5px] leading-[1.8] text-muted text-pretty">
                  {p.description}
                </p>
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                  {p.links.live && (
                    <a
                      href={p.links.live}
                      target="_blank"
                      rel="noreferrer"
                      className="u-link group font-mono text-[11px] tracking-[0.12em] text-fg"
                    >
                      live{" "}
                      <span className="inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </a>
                  )}
                  {p.links.github && (
                    <a
                      href={p.links.github}
                      target="_blank"
                      rel="noreferrer"
                      className="u-link group font-mono text-[11px] tracking-[0.12em] text-fg"
                    >
                      github{" "}
                      <span className="inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </a>
                  )}
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                    {p.stack.join(" · ")}
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            smaller things
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <WorkList projects={smaller} />
        </Reveal>
      </section>
    </div>
  );
}
