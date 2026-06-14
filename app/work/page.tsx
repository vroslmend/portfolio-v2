import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { FeaturedList } from "@/components/work/featured-list";
import { WorkList } from "@/components/work/work-list";
import { projects } from "@/data/site";

export const metadata: Metadata = {
  title: "work · ammar hassan",
  description:
    "Selected projects: CUI Central, Check!, Imaginify, Karting Analysis, and other things built over the last few years.",
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

      <FeaturedList projects={featured} />

      <section className="flex flex-col gap-6">
        <Reveal>
          <h2 className="select-none font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            smaller things
          </h2>
        </Reveal>
        <WorkList projects={smaller} />
      </section>
    </div>
  );
}
