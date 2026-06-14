import type { Metadata } from "next";
import { Fragment } from "react";
import { PriusTrigger } from "@/components/prius-trigger";
import { Reveal } from "@/components/reveal";
import { education, experience, site, toolbox } from "@/data/site";

export const metadata: Metadata = {
  title: "about · ammar hassan",
  description:
    "Developer from Lahore. Background, experience, education, and the tools I work with.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="select-none font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
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
            I&apos;m Ammar Hassan, a developer from Lahore. I like building
            for the web and{" "}
            <span className="accent-serif">getting the details right</span>.
          </p>
        </Reveal>
      </section>

      <section className="rows-hover flex flex-col">
        <Reveal>
          <div className="group grid gap-x-10 gap-y-2 border-t border-line py-6 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint transition-colors duration-500 group-hover:text-muted">
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
          <div className="group grid gap-x-10 gap-y-2 border-t border-line py-6 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint transition-colors duration-500 group-hover:text-muted">
              currently
            </span>
            <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
              I&apos;m working my way into AI engineering. Right now that mostly
              means getting properly good at Python, then building small, real
              agent projects on top of it instead of only reading about them.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="group grid gap-x-10 gap-y-2 border-y border-line py-6 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint transition-colors duration-500 group-hover:text-muted">
              off hours
            </span>
            <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
              Mostly video games with friends. Otherwise a lot of padel
              I&apos;ve never gotten good at, some cycling, and pretending the
              next new coffee place will be worth it. Forever defending the{" "}
              <PriusTrigger /> as the best car ever.
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
            <div className="grid gap-x-10 gap-y-2 border-t border-line pt-5 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
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
        <div className="rows-hover flex flex-col">
          {education.map((e, i) => (
            <Reveal key={e.school} delay={i * 0.06}>
              <div className="flex flex-col gap-y-1 border-t border-line py-4 transition-colors duration-500 hover:border-faint sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6">
                <span className="text-[15px] font-medium tracking-tight">
                  {e.school}
                </span>
                {/* Mobile: degree and period share one justified meta line.
                    sm+: display:contents drops this wrapper so all three sit
                    in the row's flex, restoring the original layout. */}
                <span className="flex items-baseline justify-between gap-x-6 sm:contents">
                  <span className="text-sm text-muted">{e.degree}</span>
                  <span className="font-mono text-[11px] text-faint">
                    {e.period}
                  </span>
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
          <p className="max-w-[60ch] select-none font-mono text-[12.5px] leading-[2.1] tracking-[0.04em] text-muted">
            {toolbox.map((t, i) => (
              // Each word+dot is one nowrap unit; the only breakable space is
              // between units, so a wrapped line always starts with a word and
              // never an orphaned dot (inline-block words otherwise let the
              // browser break right before their trailing separator).
              <Fragment key={t}>
                <span className="whitespace-nowrap">
                  <span className="inline-block cursor-default transition-[color,transform] duration-300 hover:-translate-y-px hover:text-fg">
                    {t}
                  </span>
                  {i < toolbox.length - 1 && (
                    <span className="text-faint"> ·</span>
                  )}
                </span>
                {i < toolbox.length - 1 && " "}
              </Fragment>
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
