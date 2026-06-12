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
            I&apos;m Ammar Hassan, a developer from Lahore who likes taking
            ideas from <span className="accent-serif">scratch to shipped</span>.
          </p>
        </Reveal>
      </section>

      <section className="flex flex-col">
        <Reveal>
          <div className="grid gap-x-10 gap-y-2 border-t border-line py-6 sm:grid-cols-[1fr_2fr]">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              background
            </span>
            <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
              I started out with plain HTML, CSS and JavaScript, and over time
              moved to React, Next.js and Node. Most of what I know comes from
              building real projects rather than coursework.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="grid gap-x-10 gap-y-2 border-t border-line py-6 sm:grid-cols-[1fr_2fr]">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              currently
            </span>
            <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
              Spending more of my time on the AI side of things, working with
              chatbots, vector search and the Gemini API, and putting what I
              learn into my projects.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="grid gap-x-10 gap-y-2 border-y border-line py-6 sm:grid-cols-[1fr_2fr]">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              off hours
            </span>
            <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
              Usually go-karting with friends. Naturally, I ended up writing a
              tool to analyse our lap times.
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
            If you want the short version, here&apos;s my{" "}
            <a href={site.links.resume} download="Ammar-Hassan_Resume.pdf" className="p-link">
              resume
            </a>
            . You can also reach me at{" "}
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
