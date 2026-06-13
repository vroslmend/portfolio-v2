import { FooterStats } from "@/components/footer-stats";
import { KbdHint } from "@/components/kbd-hint";
import { LocalTime } from "@/components/local-time";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-6 pb-10 pt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-line pt-6">
        <div className="flex gap-5 font-mono text-[11px] tracking-[0.12em] text-muted">
          <a href={`mailto:${site.email}`} className="u-link hover:text-fg">
            email
          </a>
          <a
            href={site.links.github}
            target="_blank"
            rel="noreferrer"
            className="u-link hover:text-fg"
          >
            github
          </a>
          <a
            href={site.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="u-link hover:text-fg"
          >
            linkedin
          </a>
        </div>
        <LocalTime />
        <div className="flex items-baseline gap-5 font-mono text-[11px] tracking-[0.12em] text-faint">
          <a
            href="https://github.com/vroslmend/portfolio-v2"
            target="_blank"
            rel="noreferrer"
            className="u-link hover:text-muted"
          >
            view source
          </a>
          <KbdHint />
          <span>© 2026</span>
        </div>
      </div>
      <div className="pt-4">
        <FooterStats />
      </div>
    </footer>
  );
}
