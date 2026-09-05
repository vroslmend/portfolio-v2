import type { Metadata } from "next";
import Link from "next/link";
import {
  EssayFooter,
  EssayHeader,
  EssaySection,
  LinearFlow,
  type EssayFlowStep,
} from "@/components/writing/essay";
import { EssayShell } from "@/components/writing/essay-shell";

export const metadata: Metadata = {
  title: "putting my spotify on the page · ammar hassan",
  description:
    "A now-playing line in the footer, the OAuth refresh-token dance behind it, and why a Vercel route handler was the right amount of backend.",
};

const requestPath: EssayFlowStep[] = [
  { label: "browser", note: "polls /api/now-playing every 20s" },
  {
    label: "route handler",
    note: "trades a refresh token for a one-hour access token",
    emphasis: true,
  },
  { label: "spotify", note: "returns the currently-playing track" },
  { label: "footer", note: "the line fades in, or stays hidden" },
];

export default function NowPlayingEssay() {
  return (
    <EssayShell>
      <EssayHeader
        eyebrow="writing — june 2026 · 4 min"
        title={
          <>
            Putting my Spotify on the page,{" "}
            <span className="accent-serif">without overdoing it</span>
          </>
        }
      >
        When I&apos;m listening to something, a small line shows up at the bottom
        of this site with the track. It&apos;s a tiny thing, and that&apos;s the point.
        What I want to write about is the little bit of backend behind it, and
        the parts I decided not to build.
      </EssayHeader>

      <EssaySection n="01" title="The line">
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
      </EssaySection>

      <EssaySection n="02" title="The shape">
        <p className="text-pretty">
          Spotify won&apos;t let the browser ask &ldquo;what is Ammar
          playing&rdquo; on its own, and it shouldn&apos;t, because that would
          mean putting a secret in the page where anyone could read it. So there
          is one small server step in the middle.
        </p>
        <LinearFlow
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
      </EssaySection>

      <EssaySection n="03" title="The choice">
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
      </EssaySection>

      <EssaySection n="04" title="Caching">
        <p className="text-pretty">
          Two bits of caching do the real work, and neither depends on where the
          code runs. The access token is good for an hour, so the server keeps it
          between requests instead of asking Spotify for a new one every time.
          And the response itself is cached at Vercel&apos;s edge for a few
          seconds, so if a handful of people are on the site at once they share
          one answer rather than each hitting Spotify. The polling is what makes
          it feel live; the caching is what keeps it from being wasteful.
        </p>
      </EssaySection>

      <EssaySection n="05" title="Closing">
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
      </EssaySection>

      <EssayFooter />
    </EssayShell>
  );
}
