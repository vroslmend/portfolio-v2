import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { education, experience, site, toolbox } from "@/data/site";

export const metadata: Metadata = {
  title: "about — ammar hassan",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-20 pb-8">
      <section className="flex flex-col gap-7">
        <Reveal mask>
          <h1 className="text-[15px] font-medium text-muted">about me.</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="max-w-[58ch] text-[19px] leading-[1.7] text-fg text-pretty">
            I like the parts of the web most people route around — race
            conditions, payment lifecycles, state that has to be{" "}
            <span className="accent-serif">right everywhere at once</span>.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="flex max-w-[58ch] flex-col gap-5 text-[15px] leading-[1.8] text-muted">
            <p className="text-pretty">
              I&apos;m a software engineering student at COMSATS University,
              Lahore. I started with the usual — React, Next.js, Node — and got
              pulled toward systems that update the moment you look at them: a
              card game where every client has to agree on the board, a campus
              platform where seven services share one realtime backbone.
            </p>
            <p className="text-pretty">
              That curiosity has grown into AI engineering — RAG pipelines,
              vector search, agents doing useful work inside real products
              rather than demos. Off the keyboard it&apos;s karting telemetry:
              I scrape our lap times and argue with friends about the
              statistics.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>experience</SectionLabel>
        </Reveal>
        {experience.map((e) => (
          <Reveal key={e.company} delay={0.08}>
            <div className="grid gap-x-10 gap-y-2 border-t border-line pt-5 sm:grid-cols-[1fr_2fr]">
              <div>
                <h3 className="text-[15px] font-medium tracking-tight">
                  {e.company}
                </h3>
                <p className="pt-1 font-mono text-[11px] tracking-[0.08em] text-faint">
                  {e.role.toLowerCase()} · {e.period}
                </p>
              </div>
              <p className="max-w-[60ch] text-[14.5px] leading-[1.8] text-muted text-pretty">
                {e.description}
              </p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>education</SectionLabel>
        </Reveal>
        <div className="flex flex-col">
          {education.map((e, i) => (
            <Reveal key={e.school} delay={i * 0.06}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line py-4">
                <span className="text-[15px] font-medium tracking-tight">
                  {e.school}
                </span>
                <span className="text-sm text-muted">{e.degree}</span>
                <span className="font-mono text-[11px] text-faint">
                  {e.period}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>toolbox</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[60ch] font-mono text-[12.5px] leading-[2.1] tracking-[0.04em] text-muted">
            {toolbox.map((t, i) => (
              <span key={t}>
                <span className="transition-colors duration-300 hover:text-fg">
                  {t}
                </span>
                {i < toolbox.length - 1 && (
                  <span className="text-faint"> · </span>
                )}
              </span>
            ))}
          </p>
        </Reveal>
      </section>

      <section className="flex flex-col gap-4">
        <Reveal>
          <SectionLabel>elsewhere</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted">
            The single-page version lives at{" "}
            <a href={site.links.resume} download="Ammar-Hassan_Resume.pdf" className="p-link">
              résumé.pdf
            </a>
            . Or skip the paperwork —{" "}
            <a href={`mailto:${site.email}`} className="p-link">
              {site.email}
            </a>
            .
          </p>
        </Reveal>
      </section>
    </div>
  );
}
