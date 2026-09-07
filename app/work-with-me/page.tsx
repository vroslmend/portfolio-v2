import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "work with me · ammar hassan",
  description:
    "Client work across websites, web applications, and useful AI tools.",
};

const areas = [
  {
    name: "websites",
    description:
      "Business and marketing sites that are clear, responsive and easy to maintain.",
  },
  {
    name: "web applications",
    description:
      "Interfaces and product features built around how people actually use them.",
  },
  {
    name: "AI tools",
    description:
      "Agents and AI features connected to real information and useful workflows.",
  },
];

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
            I work with clients to design and build websites, web applications
            and useful AI tools.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            Some projects begin as a rough idea, while others begin with
            something that needs rebuilding. I can help shape the work, build
            it and stay involved through review.
          </p>
        </Reveal>
      </section>

      <section className="flex flex-col gap-6">
        <Reveal>
          <SectionLabel>what I can help with</SectionLabel>
        </Reveal>
        <div className="rows-hover flex flex-col">
          {areas.map((area, index) => (
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
          <SectionLabel>how I work</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[60ch] text-[15px] leading-[1.8] text-muted text-pretty">
            I start by understanding what needs to change, agree on the scope
            and share the work as it develops so feedback arrives before the
            end.
          </p>
        </Reveal>
      </section>

      <section className="flex flex-col gap-4">
        <Reveal>
          <SectionLabel>get in touch</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted">
            Have something in mind?{" "}
            <a href={`mailto:${site.email}`} className="p-link">
              Tell me a little about it.
            </a>
          </p>
        </Reveal>
      </section>
    </div>
  );
}
