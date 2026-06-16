import { KbdHint } from "@/components/kbd-hint";
import { LocalTime } from "@/components/local-time";
import { NowPlaying } from "@/components/now-playing";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-6 pb-10 pt-24">
      <div className="relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-line pt-6">
        {/* a quiet line that fades in just above the footer while a track plays */}
        <NowPlaying />
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
          {/* shown only on phones, where it is dropped from the top nav. The
              hide sits on a wrapper, not the .u-link itself: .u-link is an
              unlayered rule and would otherwise win over the `sm:hidden`
              utility's display. */}
          <span className="sm:hidden">
            <a
              href={site.links.resume}
              download="Ammar-Hassan_Resume.pdf"
              className="u-link hover:text-fg"
            >
              resume
            </a>
          </span>
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
    </footer>
  );
}
