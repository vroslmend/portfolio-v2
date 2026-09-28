import Image from "next/image";
import { DiagramNode } from "@/components/writing/diagram";
import { EssayFigure } from "@/components/writing/essay";

export function KittySystemFigure() {
  return (
    <EssayFigure caption="fig. 01 — two deployments, joined by one narrow stream">
      <div
        role="img"
        aria-label="The portfolio widget sends a message, thread identifier, and validated page path to the separate Kitty service. FastAPI runs the LangGraph agent with Gemini, Neon, and bounded tools, then streams events back to the widget."
        className="grid items-stretch gap-3 border-y border-line py-5 sm:grid-cols-[1fr_5.5rem_1.25fr] sm:gap-0"
      >
        <div className="border border-line p-4">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
              portfolio-v2
            </p>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
              Next.js
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <DiagramNode label="visitor" detail="asks from the page they are reading" />
            <div className="flex justify-center font-mono text-[10px] text-muted">↓</div>
            <DiagramNode
              label="kitty widget"
              detail="message · thread · page path"
              strong
            />
          </div>
        </div>

        <div className="flex min-h-16 flex-col items-center justify-center gap-1 px-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
          <span className="hidden sm:block">request →</span>
          <span className="sm:hidden">request ↓</span>
          <span className="h-px w-full bg-line sm:block" />
          <span className="hidden sm:block">← events</span>
          <span className="sm:hidden">events ↑</span>
        </div>

        <div className="border border-line p-4">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
              kitty-agent
            </p>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
              Python
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <DiagramNode label="FastAPI /chat" detail="admission · SSE framing" />
            <div className="flex justify-center font-mono text-[10px] text-muted">↓</div>
            <DiagramNode
              label="LangGraph loop"
              detail="decide · call · observe · answer"
              strong
            />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <DiagramNode label="Gemini" />
              <DiagramNode label="Neon" />
              <DiagramNode label="tools" />
            </div>
          </div>
        </div>
      </div>
    </EssayFigure>
  );
}

const toolNames = [
  "projects",
  "writing",
  "profile",
  "navigation",
  "github",
  "spotify",
];

export function KittyLoopFigure() {
  return (
    <EssayFigure caption="fig. 02 — the result returns to the model; a tool call is not the end">
      <div
        role="img"
        aria-label="A visitor message enters the agent. The agent can answer, call a tool and receive its result before deciding again, or pause for clarification and resume from the visitor's choice."
        className="overflow-hidden border-y border-line py-6"
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:grid-cols-[1fr_2.1rem_1.2fr_2.1rem_1fr]">
          <DiagramNode label="message" detail="visitor turn" />
          <span className="text-center font-mono text-[11px] text-muted">→</span>
          <div className="flex min-h-32 flex-col items-center justify-center border border-faint bg-surface px-3 py-2 text-center">
            <Image
              src="/kitty/cat-8273689.svg"
              alt=""
              width={82}
              height={82}
              unoptimized
              className="kitty-art h-20 w-20 opacity-90"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
              agent
            </p>
          </div>
          <span className="hidden text-center font-mono text-[11px] text-muted sm:block">→</span>
          <DiagramNode
            label="answer"
            detail="when no tool call remains"
            className="hidden sm:block"
          />
        </div>

        <div className="mx-auto grid w-[68%] grid-cols-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted sm:w-[48%]">
          <div className="border-r border-line py-3 pr-3">tool call ↓</div>
          <div className="py-3 pl-3">↑ result</div>
        </div>

        <div className="border border-line p-3">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
              ToolNode
            </p>
            <span className="font-mono text-[9px] text-muted">bounded surface</span>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-3">
            {toolNames.map((tool) => (
              <span
                key={tool}
                className="border-b border-r border-line px-2 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto h-5 border-l border-dashed border-faint" />
        <div className="mx-auto max-w-sm border border-dashed border-faint px-3 py-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            ambiguous request
          </p>
          <p className="mt-1 text-[12px] text-muted">
            interrupt → visitor chooses → resume the same run
          </p>
        </div>

        <div className="mt-5 border-t border-line pt-3 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted sm:hidden">
          answer when the loop ends
        </div>
      </div>
    </EssayFigure>
  );
}

const streamEvents = [
  {
    type: "step",
    payload: "looking through the projects",
    effect: "change the cat's working state",
  },
  {
    type: "token",
    payload: "The project uses…",
    effect: "grow one answer in place",
  },
  {
    type: "question",
    payload: "Which project?",
    effect: "show choices while the graph waits",
    branch: true,
  },
  {
    type: "done",
    payload: "thread_id",
    effect: "keep the conversation resumable",
  },
];

export function KittyStreamFigure() {
  return (
    <EssayFigure caption="fig. 03 — the interface receives events, not one finished blob">
      <div
        role="table"
        aria-label="Server sent event types and how the Kitty widget renders each one"
        className="border-t border-line"
      >
        <div
          role="row"
          className="hidden grid-cols-[5.5rem_1fr_1.25fr] border-b border-line py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted sm:grid"
        >
          <span role="columnheader">event</span>
          <span role="columnheader">payload</span>
          <span role="columnheader">what the widget does</span>
        </div>
        {streamEvents.map((event) => (
          <div
            role="row"
            key={event.type}
            className={`grid gap-1 border-b py-4 sm:grid-cols-[5.5rem_1fr_1.25fr] sm:gap-4 ${
              event.branch ? "border-dashed border-faint" : "border-line"
            }`}
          >
            <span
              role="cell"
              className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                event.type === "token" ? "text-fg" : "text-muted"
              }`}
            >
              {event.type}
            </span>
            <code role="cell" className="text-[12px] text-muted">
              {event.payload}
            </code>
            <span role="cell" className="text-[12px] leading-[1.5] text-muted">
              {event.effect}
            </span>
          </div>
        ))}
      </div>
    </EssayFigure>
  );
}

const failures = [
  {
    symptom: "a tool turn broke on the next message",
    cause: "Gemini's hidden thought signature had been stripped",
    boundary: "preserve the original message objects",
  },
  {
    symptom: "the voice became a collection of tics",
    cause: "the model kept learning from its own long transcript",
    boundary: "keep a coherent recent window; remove example lines",
  },
  {
    symptom: "a provider limit looked like a long hang",
    cause: "the adapter retried and waited out of sight",
    boundary: "bound retries and time; return a visible busy state",
  },
  {
    symptom: "a simple “i see” received invented filler",
    cause: "the model had nothing meaningful to generate",
    boundary: "handle pure acknowledgements before the model",
  },
];

export function KittyFailureFigure() {
  return (
    <EssayFigure caption="fig. 04 — recurring failures ended in code boundaries, not more prompt text">
      <div
        role="table"
        aria-label="Reliability failures, their root causes, and the deterministic boundary used to prevent them"
        className="border-t border-line"
      >
        <div
          role="row"
          className="hidden grid-cols-[1fr_1fr_1.15fr] gap-5 border-b border-line py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted sm:grid"
        >
          <span role="columnheader">what I saw</span>
          <span role="columnheader">what was underneath</span>
          <span role="columnheader">where the fix lives</span>
        </div>
        {failures.map((failure, index) => (
          <div
            role="row"
            key={failure.symptom}
            className="grid gap-3 border-b border-line py-5 sm:grid-cols-[1fr_1fr_1.15fr] sm:gap-5"
          >
            <div role="cell" className="flex gap-3">
              <span className="font-mono text-[9px] text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[12px] leading-[1.55] text-muted">
                {failure.symptom}
              </span>
            </div>
            <span role="cell" className="text-[12px] leading-[1.55] text-muted">
              {failure.cause}
            </span>
            <span role="cell" className="text-[12px] font-medium leading-[1.55] text-fg">
              {failure.boundary}
            </span>
          </div>
        ))}
      </div>
    </EssayFigure>
  );
}
