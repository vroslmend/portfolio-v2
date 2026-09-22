import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { AreasAndWork } from "@/components/work-with-me/areas-and-work";
import { clientRecentWork, clientServices, projects, site } from "@/data/site";

export const metadata: Metadata = {
  title: "work with me · ammar hassan",
  description:
    "Client work across websites, web applications, AI assistants, backends and automation.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="select-none font-mono text-[12px] uppercase tracking-[0.18em] text-faint">
      {children}
    </h2>
  );
}

// Resolve and check the data up front so a mistyped slug fails the build,
// rather than a highlight quietly pointing at a project that isn't listed.
const projectsBySlug = new Map(projects.map((p) => [p.slug, p]));
const recentWork = clientRecentWork.map((slug) => {
  const project = projectsBySlug.get(slug);
  if (!project) throw new Error(`clientRecentWork: no project "${slug}"`);
  return project;
});
for (const area of clientServices) {
  for (const slug of area.work) {
    if (!clientRecentWork.includes(slug)) {
      throw new Error(`"${area.name}" points to "${slug}", which isn't in clientRecentWork`);
    }
  }
}

export default function WorkWithMePage() {
  return (
    <div className="flex flex-col gap-20 pb-8">
      <section className="flex flex-col gap-7">
        <Reveal mask>
          <h1 className="display-title text-fg">work with me.</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            If you need something built, I can take on the whole thing or just
            the part you&apos;re stuck on.
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

      <AreasAndWork areas={clientServices} work={recentWork} />

      <section className="flex flex-col gap-4">
        <Reveal>
          <SectionLabel>get in touch</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted">
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
