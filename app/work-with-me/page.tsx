import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { clientServices, clientWork, site } from "@/data/site";

export const metadata: Metadata = {
  title: "work with me · ammar hassan",
  description:
    "Client work across websites, web applications, AI assistants and agents, cloud systems and integrations.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="select-none font-mono text-[12px] uppercase tracking-[0.18em] text-faint">
      {children}
    </h2>
  );
}

const clientWorkByKey = new Map(clientWork.map((work) => [work.key, work]));

// Every area shows one example. Resolve them up front so a mistyped key fails
// the build instead of quietly rendering an area with nothing under it.
const areas = clientServices.map((area) => {
  const example = clientWorkByKey.get(area.example);
  if (!example) {
    throw new Error(`No clientWork entry "${area.example}" for "${area.name}"`);
  }
  return { ...area, example };
});

export default function WorkWithMePage() {
  return (
    <div className="flex flex-col gap-20 pb-8">
      <section className="flex flex-col gap-7">
        <Reveal mask>
          <h1 className="display-title text-fg">work with me.</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            If you need something built, whether it&apos;s a website, an
            application or an AI feature, I can take on the whole thing or just
            the part you&apos;re stuck on. Under each area is an example of work
            I&apos;ve already done.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="font-mono text-[11px] tracking-[0.12em] text-faint">
            available for client work <span aria-hidden="true">·</span>{" "}
            <a
              href={`mailto:${site.email}`}
              className="u-link text-muted hover:text-fg"
            >
              email me →
            </a>
          </p>
        </Reveal>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>what I can help with</SectionLabel>
        </Reveal>
        <div className="rows-hover flex flex-col">
          {areas.map(({ name, description, example }, index) => (
            <Reveal key={name} delay={index * 0.06}>
              <article className="group grid gap-x-10 gap-y-3 border-t border-line py-7 transition-colors duration-500 hover:border-faint sm:grid-cols-[1fr_2fr]">
                <h3 className="text-[15px] font-medium tracking-tight">
                  {name}
                </h3>
                <div className="flex max-w-[60ch] flex-col">
                  <p className="text-[14.5px] leading-[1.8] text-muted text-pretty">
                    {description}
                  </p>
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="select-none font-mono text-[11px] tracking-[0.08em] text-faint">
                      for example
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                      <div>
                        <h4 className="text-[14px] font-medium tracking-tight text-fg">
                          {example.name}
                        </h4>
                        <p className="pt-1 font-mono text-[11px] tracking-[0.08em] text-faint">
                          {example.meta}
                        </p>
                      </div>
                      <p className="text-[13.5px] leading-[1.75] text-muted text-pretty">
                        {example.description}
                      </p>
                      {example.links.length > 0 && (
                        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                          {example.links.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              target={link.external ? "_blank" : undefined}
                              rel={link.external ? "noreferrer" : undefined}
                              className="u-link group/link whitespace-nowrap font-mono text-[11px] tracking-[0.12em] text-fg"
                            >
                              {link.label}{" "}
                              <span
                                aria-hidden="true"
                                className={`inline-block transition-transform duration-500 ease-out-expo group-hover/link:translate-x-0.5 ${link.external ? "group-hover/link:-translate-y-0.5" : ""}`}
                              >
                                {link.external ? "↗" : "→"}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Reveal>
          <SectionLabel>get in touch</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            If what you have in mind doesn&apos;t fit neatly into one of these,
            that&apos;s fine. Most real work doesn&apos;t. Send me a short note
            about what you&apos;re building and where it stands.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <a
            href={`mailto:${site.email}`}
            className="u-link group self-start font-mono text-[11px] tracking-[0.12em] text-fg"
          >
            {site.email}{" "}
            <span className="inline-block transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </Reveal>
      </section>
    </div>
  );
}
