import type { Metadata } from "next";
import Link from "next/link";
import {
  EssayFooter,
  EssayHeader,
  EssaySection,
} from "@/components/writing/essay";
import { EssayShell } from "@/components/writing/essay-shell";
import {
  KittyFailureFigure,
  KittyLoopFigure,
  KittyStreamFigure,
  KittySystemFigure,
} from "@/components/writing/kitty-figures";

export const metadata: Metadata = {
  title: "teaching the cat in the footer to answer back · ammar hassan",
  description:
    "How Kitty became a small LangGraph agent for this portfolio, and what tool routing, streaming, persistence, evaluation, and real failures taught me along the way.",
};

const repo = "https://github.com/vroslmend/kitty-agent";

export default function KittyEssay() {
  return (
    <EssayShell>
      <EssayHeader
        eyebrow="writing — september 2026 · 9 min"
        title={
          <>
            Teaching the cat in the footer to{" "}
            <span className="accent-serif">answer back</span>
          </>
        }
      >
        There is a cat sitting on the line above this site&apos;s footer. Open it and
        you can ask about my projects, writing, background, or what has been
        happening lately. The panel is small. The system behind it took rather
        more work.
      </EssayHeader>

      <EssaySection n="01" title="A narrow job">
        <p className="text-pretty">
          I did not want a general chatbot floating over a portfolio. It would
          know less about the site than the site itself, and it would spend most
          of its time inviting people to ask questions they never came here to
          ask. Kitty has a smaller job: help a visitor understand the work that
          is already here.
        </p>
        <p className="text-pretty">
          That means it can compare projects, find an essay, explain something
          on the current page, read my public background, check recent GitHub
          activity, or see what Spotify is playing. It cannot browse the wider
          web, send email, run code, or quietly become a different assistant.
          The useful boundary is this site and the few public sources attached
          to it.
        </p>
        <p className="text-pretty">
          The interface follows the same rule. It lives in the footer rather
          than arriving as a chat bubble, opens as an editorial rail or a
          page-edge sheet, and shows the work as short status lines beside the
          cat. The answer remains the point. The character is there to make the
          wait feel considered, not to make the answer less useful.
        </p>
      </EssaySection>

      <EssaySection n="02" title="Two projects, one conversation">
        <p className="text-pretty">
          The widget belongs to this Next.js portfolio. The agent is a separate
          Python service. They deploy independently on Vercel and share no
          application state in memory. Their whole relationship is one request
          and one event stream.
        </p>
        <KittySystemFigure />
        <p className="text-pretty">
          The browser sends the message, an optional conversation id, and the
          route it is currently showing. FastAPI admits the request and hands it
          to the graph. Neon stores checkpoints, Gemini makes the language and
          routing decisions, and the tools read either prepared site content or
          a live public source. Events travel back as they happen.
        </p>
        <p className="text-pretty">
          Keeping the repositories separate made the boundary honest. The
          portfolio does not import agent code, and the service does not scrape
          the deployed site during a question. A development-time sync copies
          project, profile, and route data into the service. Essays are embedded
          separately for passage search. A serverless instance can disappear
          after any turn because the conversation lives elsewhere.
        </p>
      </EssaySection>

      <EssaySection n="03" title="The loop is the agent">
        <p className="text-pretty">
          I used LangGraph&apos;s graph primitives directly instead of its prebuilt
          agent helper. There are only two working nodes. The agent node calls
          Gemini with a bounded set of tools. If the result contains tool calls,
          a <code>ToolNode</code> executes them and appends their results. Then
          the agent sees those results and decides again. With no tool call
          left, the run ends and the answer is complete.
        </p>
        <KittyLoopFigure />
        <p className="text-pretty">
          This is why I call it an agent rather than a retrieval chatbot.
          Retrieval is one possible action. A project question reads structured
          project data; an opinion question searches the writing; a request to
          &ldquo;take me there&rdquo; asks the navigation tool for a real route;
          a question about recent work goes to GitHub. One turn can use several
          tools if it needs them.
        </p>
        <p className="text-pretty">
          Ambiguity is part of the graph too. The clarification tool interrupts
          the run with named choices and stores that pause in Postgres. The
          visitor&apos;s next message resumes the same tool call instead of starting
          a detached conversation. It is a small feature, but it makes the
          difference between pretending to understand and knowing when not to.
        </p>
      </EssaySection>

      <EssaySection n="04" title="The stream is part of the product">
        <p className="text-pretty">
          A correct answer that leaves the panel blank while it works still
          feels broken. The service therefore streams four small event shapes
          over server-sent events. The frontend turns them into visible state
          rather than exposing model plumbing.
        </p>
        <KittyStreamFigure />
        <p className="text-pretty">
          A <code>step</code> event might say &ldquo;reading the
          writing&rdquo; while a tool runs. <code>token</code> events grow one
          answer in place, with updates grouped to one paint per animation
          frame. A <code>question</code> event draws the clarification choices.
          <code>done</code> returns the thread id that makes the next turn
          continuous.
        </p>
        <p className="text-pretty">
          Two details mattered more than they looked. Every SSE record needs its
          blank-line terminator or a proxy can hold the stream as one delayed
          blob. And status-label pacing cannot sit inside the read loop: when it
          did, quick tool results queued behind the animation and the answer
          arrived in a burst. The interface may slow a label down; it must never
          slow the network down.
        </p>
      </EssaySection>

      <EssaySection n="05" title="What actually broke">
        <p className="text-pretty">
          The first useful version was not the difficult part. The difficult
          part was keeping it useful after real conversations, cold starts,
          provider limits, and the model&apos;s own habits began to interact. Most
          of the lasting fixes were not more prompt text. They were clearer
          boundaries around the model.
        </p>
        <KittyFailureFigure />
        <p className="text-pretty">
          Gemini attaches an invisible thought signature to a tool call and
          expects the same message object back on the next turn. Rebuilding the
          history into cleaner objects removed it and broke the conversation.
          The graph now trims by selecting original messages, never by
          reconstructing them.
        </p>
        <p className="text-pretty">
          Long conversations failed differently. Kitty began borrowing phrases
          from its own earlier answers until a dry voice became a set of stock
          lines. The fix was a bounded, coherent history window and a prompt
          that describes the register without giving it example dialogue to
          copy. A separate guard checks the opening of every answer for leaked
          instructions before a token reaches the browser.
        </p>
        <p className="text-pretty">
          The strangest small failure came from messages such as &ldquo;cool&rdquo;
          and &ldquo;i see&rdquo;. They contain no new request, so asking a language
          model to improvise a response sometimes produced a grammatical
          non sequitur. Pure acknowledgements now take a strict path before the
          model and select from a few vetted closers. There is no intelligence
          to gain from generating what is already known.
        </p>
        <p className="text-pretty">
          Latency had the same lesson. During quota pressure, the model adapter
          retried in the background and a short failure looked like a very slow
          answer. Kitty now bounds retries and model time, then turns a provider
          limit into a visible busy state. The site also touches the service and
          its database while the visitor is reading, so two cold starts can wake
          in parallel with their attention rather than after the first question.
        </p>
      </EssaySection>

      <EssaySection n="06" title="Keeping it honest">
        <p className="text-pretty">
          The model chooses what to do, but it does not choose what counts as a
          fact. Project links and site routes come from generated portfolio
          data. Essay claims come from retrieved passages with their source
          route. The current page is accepted only after the service matches it
          against that route map. GitHub and Spotify provide the two things that
          are supposed to be current.
        </p>
        <p className="text-pretty">
          Tool routing and answer quality are tested separately. Routing can be
          checked mechanically: which tools ran, in what order, and whether an
          invented path appeared. Answers are judged against requirements for
          that case. Controlled failures replace GitHub, Spotify, the database,
          or the model with deterministic fakes, so the test suite never needs
          a cooperative network to prove that a bad upstream becomes a useful
          response.
        </p>
        <p className="text-pretty">
          I also decided not to add MCP for the first release. It would have
          made the repository look more current without making the widget more
          helpful. There is no external client waiting to consume these tools,
          and the browser already has the narrow interface it needs. If a real
          consumer appears, the protocol can earn its place then. Until that
          happens, it is another surface to maintain and explain.
        </p>
        <p className="text-pretty">
          The complete implementation, tests, and operating notes are in the{" "}
          <a
            href={repo}
            target="_blank"
            rel="noreferrer"
            className="u-link text-fg hover:text-muted"
          >
            Kitty repository
          </a>
          . The shorter project view is on the{" "}
          <Link href="/work" className="u-link text-fg hover:text-muted">
            work page
          </Link>
          .
        </p>
      </EssaySection>

      <EssaySection n="07" title="Closing">
        <p className="text-pretty">
          Kitty began as a way to make a portfolio less passive. What made it a
          worthwhile project was not putting a model behind a cat. It was
          deciding what the model should control, noticing where that control
          failed, and moving each hard guarantee into ordinary code.
        </p>
        <p className="text-pretty">
          The graph is small enough to understand in one sitting. Around it are
          the less glamorous parts that make it safe to leave on a public site:
          trusted content, durable state, a visible stream, narrow tools,
          admission limits, failure paths, and tests that disagree with a
          plausible answer when it took the wrong route. The cat is the part a
          visitor meets. The boundaries are the part that lets it stay there.
        </p>
      </EssaySection>

      <EssayFooter />
    </EssayShell>
  );
}
