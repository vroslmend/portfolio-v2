import type { Metadata } from "next";
import Link from "next/link";
import { ReadingProgress } from "@/components/reading-progress";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "putting my spotify on the page · ammar hassan",
  description:
    "A now-playing line in the footer, the OAuth refresh-token dance behind it, and why a Vercel route handler was the right amount of backend.",
};

type Step = { label: string; note: string; emphasis?: boolean };

const requestPath: Step[] = [
  { label: "browser", note: "polls /api/now-playing every 20s" },
  {
    label: "route handler",
    note: "trades a refresh token for a one-hour access token",
    emphasis: true,
  },
  { label: "spotify", note: "returns the currently-playing track" },
  { label: "footer", note: "the line fades in, or stays hidden" },
];

function Flow({
  steps,
  caption,
  label,
}: {
  steps: Step[];
  caption: string;
  label: string;
}) {
  return (
    <figure className="select-none py-3">
      <ul className="flex flex-col" aria-label={label}>
        {steps.map((step) => (
          <li
            key={step.label}
            className="relative flex flex-wrap items-baseline gap-x-4 gap-y-0.5 border-l border-line pb-6 pl-6 last:border-transparent last:pb-1"
          >
            <span
              aria-hidden
              className={`absolute -left-[4px] top-[9px] size-[7px] rounded-full ${
                step.emphasis ? "bg-fg" : "border border-faint bg-bg"
              }`}
            />
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                step.emphasis ? "font-medium text-fg" : "text-muted"
              }`}
            >
              {step.label}
            </span>
            <span className="text-[13px] text-faint">{step.note}</span>
          </li>
        ))}
      </ul>
      <figcaption className="pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
        {caption}
      </figcaption>
    </figure>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="flex items-baseline gap-3 text-[16px] font-medium tracking-tight">
          <span className="select-none font-mono text-[11px] text-faint">
            {n}
          </span>
          {title}
        </h2>
        <div className="flex flex-col gap-4 text-[15px] leading-[1.8] text-muted">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

export default function NowPlayingEssay() {
  return (
    <article className="flex flex-col gap-10 pb-8">
      <ReadingProgress />
      <header className="flex flex-col gap-5">
        <Reveal mask>
          <p className="select-none font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            writing — june 2026 · 4 min
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="max-w-[24ch] text-[26px] font-medium leading-[1.25] tracking-tight text-fg sm:text-[32px]">
            Putting my Spotify on the page,{" "}
            <span className="accent-serif">without overdoing it</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            When I&apos;m listening to something, a small line shows up at the
            bottom of this site with the track. It&apos;s a tiny thing, and
            that&apos;s the point. What I want to write about is the little bit of
            backend behind it, and the parts I decided not to build.
          </p>
        </Reveal>
      </header>

      <Section n="01" title="The line">
        <p className="text-pretty">
          It shows what I&apos;m playing on Spotify, and nothing more. When
          I&apos;m not listening, the footer looks exactly like it always does,
          with no empty slot left behind. When a track is on, a quiet line fades
          in: a little equalizer, the song, the artist. The first time you reach
          the footer it spells out &ldquo;listening to&rdquo; so you know what
          it is,
          then it tucks that label away and leaves just the bars and the song.
          No album art down there, no panel. It&apos;s meant to be noticed once
          and then ignored.
        </p>
      </Section>

      <Section n="02" title="The shape">
        <p className="text-pretty">
          Spotify won&apos;t let the browser ask &ldquo;what is Ammar
          playing&rdquo; on its own, and it shouldn&apos;t, because that would
          mean putting a secret in the page where anyone could read it. So there
          is one small server step in the middle.
        </p>
        <Flow
          steps={requestPath}
          label="Request path: the browser polls a Vercel route handler, which exchanges a refresh token for an access token and asks Spotify what is playing, then the footer shows it"
          caption="fig. 01 — one poll, four steps. the refresh token never leaves the server"
        />
        <p className="text-pretty">
          The browser polls a single endpoint every twenty seconds. That
          endpoint runs on Vercel, in the same project as the site. It holds a
          refresh token, trades it with Spotify for an access token that lasts an
          hour, asks what&apos;s currently playing, and hands back a few fields:
          the title, the artist, a link. If nothing&apos;s on, it says so and the
          footer stays quiet.
        </p>
        <p className="text-pretty">
          The refresh token is the whole trick. You log in to Spotify once, by
          hand, and get a token that doesn&apos;t expire. After that the server
          can quietly swap it for a fresh hour-long access token whenever it
          needs one, with no login screen and no secret ever reaching the
          browser.
        </p>
      </Section>

      <Section n="03" title="The choice">
        <p className="text-pretty">
          I already had somewhere I could have put this. The visitor counter at
          the bottom of the site is a real AWS backend, with Lambda and Terraform
          and a deploy pipeline. I could have added a Spotify endpoint to it, or
          stood up a separate little service just for this.
        </p>
        <p className="text-pretty">
          I didn&apos;t, because this is a read-through proxy and that would have
          been too much. A route handler on Vercel lives in the same project as
          the site, so there&apos;s nothing separate to deploy, no cross-origin
          setup, and the secret is just an environment variable. It was the
          smaller option and it was the right one. I wrote about the opposite
          call in the{" "}
          <Link
            href="/writing/visitor-counter"
            className="u-link text-fg hover:text-muted"
          >
            counter piece
          </Link>
          , where I deliberately built far more than the job needed, to practice
          the full setup. The skill is knowing which situation you&apos;re in.
        </p>
      </Section>

      <Section n="04" title="Caching">
        <p className="text-pretty">
          Two bits of caching do the real work, and neither depends on where the
          code runs. The access token is good for an hour, so the server keeps it
          between requests instead of asking Spotify for a new one every time.
          And the response itself is cached at Vercel&apos;s edge for a few
          seconds, so if a handful of people are on the site at once they share
          one answer rather than each hitting Spotify. The polling is what makes
          it feel live; the caching is what keeps it from being wasteful.
        </p>
      </Section>

      <Section n="05" title="Closing">
        <p className="text-pretty">
          So this is the counter&apos;s mirror image. There I wrapped a number
          that barely matters in remote state, federated login, and
          infrastructure-as-code. Here I had a feature that could have justified
          all of that, and kept it to one file and an environment variable
          instead.
        </p>
        <p className="text-pretty">
          Both felt right, for the same reason: spend about as much as the job is
          worth. The counter was a reason to build the whole pipeline. This was a
          reason to build <span className="accent-serif">almost nothing</span>.
          Same judgment, pointed the other way.
        </p>
      </Section>

      <Reveal>
        <footer className="border-t border-line pt-6">
          <Link
            href="/writing"
            className="u-link font-mono text-[11px] tracking-[0.12em] text-muted hover:text-fg"
          >
            ← all writing
          </Link>
        </footer>
      </Reveal>
    </article>
  );
}
