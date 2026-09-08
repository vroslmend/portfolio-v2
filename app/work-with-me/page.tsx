import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { clientProcess, clientServices, clientWork, site } from "@/data/site";

export const metadata: Metadata = {
  title: "work with me · ammar hassan",
  description:
    "Client work across websites, web applications, and useful AI tools.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="select-none font-mono text-[12px] uppercase tracking-[0.18em] text-faint">
      {children}
    </h2>
  );
}

export default function WorkWithMePage() {
  return (
    <div className="flex flex-col gap-20 pb-8">
      <section className="flex flex-col gap-7">
        <Reveal mask>
          <h1 className="display-title text-fg">work with me.</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="max-w-[58ch] text-[19px] leading-[1.7] text-fg text-pretty">
            I design and build websites, web applications and AI systems for
            clients.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            I can help shape something new, improve what is already there or
            take on one part of a larger project.
          </p>
        </Reveal>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>what I can help with</SectionLabel>
        </Reveal>
        <div className="rows-hover flex flex-col">
          {clientServices.map((area, index) => (
            <Reveal key={area.name} delay={index * 0.06}>
              <div className="group grid gap-x-10 gap-y-2 border-t border-line py-6 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
                <h3 className="text-[15px] font-medium tracking-tight">
                  {area.name}
                </h3>
                <p className="max-w-[60ch] text-[14.5px] leading-[1.8] text-muted text-pretty">
                  {area.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>selected work</SectionLabel>
        </Reveal>
        <div className="rows-hover flex flex-col">
          {clientWork.map((work, index) => (
            <Reveal key={work.name} delay={index * 0.06}>
              <article className="group grid gap-x-10 gap-y-3 border-t border-line py-7 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
                <div>
                  <h3 className="text-[15px] font-medium tracking-tight">
                    {work.name}
                  </h3>
                  <p className="pt-1 font-mono text-[10px] uppercase leading-[1.7] tracking-[0.1em] text-faint">
                    {work.meta}
                  </p>
                </div>
                <div className="flex max-w-[60ch] flex-col gap-4">
                  <p className="text-[14.5px] leading-[1.8] text-muted text-pretty">
                    {work.description}
                  </p>
                  {work.links.length > 0 && (
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                      {work.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noreferrer" : undefined}
                          className="u-link group/link font-mono text-[10px] uppercase tracking-[0.12em] text-fg"
                        >
                          {link.label}{" "}
                          <span className="inline-block transition-transform duration-500 ease-out-expo group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
                            {link.external ? "↗" : "→"}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
          <Reveal delay={clientWork.length * 0.06}>
            <p className="border-t border-line py-4 text-[12.5px] leading-[1.8] text-faint">
              also in progress: a WhatsApp assistant and a workflow integration
              demo.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>how I work</SectionLabel>
        </Reveal>
        <div className="rows-hover flex flex-col">
          {clientProcess.map((step, index) => (
            <Reveal key={step.name} delay={index * 0.06}>
              <div className="group grid gap-x-10 gap-y-2 border-t border-line py-5 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-medium tracking-tight">
                    {step.name}
                  </h3>
                </div>
                <p className="max-w-[60ch] text-[14.5px] leading-[1.8] text-muted text-pretty">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Reveal>
          <SectionLabel>get in touch</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted">
            If you have something in mind, you can reach me at{" "}
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
