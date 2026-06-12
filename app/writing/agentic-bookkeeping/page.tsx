import type { Metadata } from "next";
import Link from "next/link";
import { ReadingProgress } from "@/components/reading-progress";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "agents that do bookkeeping — ammar hassan",
  description:
    "An architecture for automating recurring bookkeeping work with AI agents, a deterministic core, and a hard human approval gate.",
};

const pipeline = [
  { label: "bank data", note: "csv exports or a feed" },
  { label: "01 — categorize", note: "history first, the model only for the new" },
  { label: "02 — reconcile", note: "deterministic matching, no llm arithmetic" },
  { label: "03 — qa", note: "exceptions, sorted by severity" },
  { label: "human review", note: "approve, edit, or reject", gate: true },
  { label: "ledger", note: "system of record" },
];

function PipelineDiagram() {
  return (
    <figure className="select-none py-3">
      <ul
        className="flex flex-col"
        aria-label="Pipeline: bank data flows through categorize, reconcile and QA agents, then a human review gate, before reaching the ledger"
      >
        {pipeline.map((step) => (
          <li
            key={step.label}
            className="relative flex flex-wrap items-baseline gap-x-4 gap-y-0.5 border-l border-line pb-6 pl-6 last:border-transparent last:pb-1"
          >
            <span
              aria-hidden
              className={`absolute -left-1 top-[3px] size-[7px] rounded-full ${
                step.gate ? "bg-fg" : "border border-faint bg-bg"
              }`}
            />
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                step.gate ? "font-medium text-fg" : "text-muted"
              }`}
            >
              {step.label}
            </span>
            <span className="text-[13px] text-faint">{step.note}</span>
          </li>
        ))}
      </ul>
      <figcaption className="pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
        fig. 01 — nothing reaches the ledger without approval
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

export default function AgenticBookkeepingEssay() {
  return (
    <article className="flex flex-col gap-10 pb-8">
      <ReadingProgress />
      <header className="flex flex-col gap-5">
        <Reveal mask>
          <p className="select-none font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            writing — may 2026 · 6 min
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="max-w-[24ch] text-[26px] font-medium leading-[1.25] tracking-tight text-fg sm:text-[32px]">
            Agents that do bookkeeping, with humans{" "}
            <span className="accent-serif">where it matters</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            Earlier this year I spoke with a US accounting firm about their
            client bookkeeping operation. Afterwards I wrote them a short
            architecture concept: how much of the recurring monthly work could
            AI agents honestly take on today, without pretending the failure
            modes don&apos;t exist. This is that concept.
          </p>
        </Reveal>
      </header>

      <Section n="01" title="The work">
        <p className="text-pretty">
          A typical client-accounting team runs a four-step monthly cycle. A
          junior bookkeeper imports bank and card transactions and assigns
          each one to a category in the client&apos;s chart of accounts. A
          senior bookkeeper reconciles the ledger against the actual bank
          statement, line by line. A controller reviews the completed books,
          makes adjusting entries, and signs off. Then the financial package
          goes out.
        </p>
        <p className="text-pretty">
          Most of the first three steps follows learnable rules. A vendor maps
          to the same category month after month; a certain pattern always
          means a transfer; a certain anomaly always deserves a closer look.
          The interesting move is shifting the rule-based parts to software so
          human time concentrates on the parts that actually require judgment.
        </p>
      </Section>

      <Section n="02" title="The shape of the system">
        <p className="text-pretty">
          Three coordinated agents and one human approval gate. The accounting
          platform stays the system of record, and no agent writes to it
          directly — every entry passes through a person first.
        </p>
        <PipelineDiagram />
        <p className="text-pretty">
          The first agent categorizes. For each transaction it checks history
          before it checks intelligence: a vector lookup over the
          client&apos;s past categorizations, so a vendor that has been filed
          the same way fifty times costs nothing to file the fifty-first time.
          Only genuinely novel transactions go to the language model, which
          gets the transaction, the chart of accounts and the closest
          historical examples, and returns a category with a confidence score.
          High confidence is queued for approval; low confidence is flagged
          for an explicit human decision.
        </p>
        <p className="text-pretty">
          The second agent reconciles — matching recorded entries against the
          bank statement and flagging what&apos;s missing, duplicated, or off
          by some amount. The third reads the closed period, compares it
          against prior ones, and produces an exception list sorted by
          severity: the category that suddenly tripled, the payroll account
          that went quiet in a month with payroll, the suspiciously round
          number where amounts are usually messy.
        </p>
        <p className="text-pretty">
          The reviewer sees all of it in one dashboard — proposed category,
          confidence, the system&apos;s reasoning, one-click approve, edit, or
          reject. Bookkeepers stop categorizing hundreds of routine
          transactions and start reviewing a short list of flagged ones, with
          a full audit trail of what was decided and why.
        </p>
      </Section>

      <Section n="03" title="The decisions that matter">
        <p className="text-pretty">
          <b className="font-medium text-fg">
            The language model never touches arithmetic.
          </b>{" "}
          Language models are text predictors with well-documented arithmetic
          failure modes, and in bookkeeping a single wrong sum can mean a
          misfiled return. So the split is enforced in code: the model reads
          descriptions, matches vendors, explains its choices — and
          deterministic Python does every sum, balance check, and match. If
          debits and credits don&apos;t balance, the pipeline halts. No number
          that reaches the books was generated by AI. This is the single most
          consequential decision in the design.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">
            The approval gate is code, not policy.
          </b>{" "}
          The orchestration layer physically pauses before any write and
          resumes only on explicit human approval — at maximum model
          confidence, still. Loosening that later, for narrow categories the
          accountants trust, is their decision to make, not the
          software&apos;s.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">Boring database, on purpose.</b>{" "}
          Decisions, approvals, and write events live in PostgreSQL because
          financial records need ACID guarantees — a crashed write either
          commits fully or not at all. The same database does vector search
          for the history lookups, so the system learns from every approved
          categorization: accuracy goes up and API cost goes down as history
          accumulates.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">
            Client data stays inside one envelope.
          </b>{" "}
          The model is accessed through the firm&apos;s existing cloud
          provider rather than a public AI API, so financial data never leaves
          that infrastructure and nothing is retained for training — the
          posture a licensed firm&apos;s confidentiality obligations actually
          require.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">
            Work with the APIs you actually get.
          </b>{" "}
          The dominant accounting platform doesn&apos;t expose bank-feed data
          through its public API, so the pipeline ingests from the source —
          CSV exports or a bank-data provider — and writes approved entries
          back through the standard API. And because real client bases are
          never on one platform, the agents are platform-agnostic: they emit
          structured journal entries, and an integration layer translates per
          destination.
        </p>
      </Section>

      <Section n="04" title="Limits">
        <p className="text-pretty">
          The design covers the highest-volume, most repetitive work:
          categorization, reconciliation, quality review. It does not attempt
          multi-entity consolidations, sales tax, foreign currency, or the
          journal entries that never come from a bank feed — depreciation,
          payroll allocations, amortization. The QA agent would notice those
          are missing; it wouldn&apos;t create them. And nothing here touches
          professional judgment: GAAP questions, audit defense, tax planning
          stay human.
        </p>
      </Section>

      <Section n="05" title="Closing">
        <p className="text-pretty">
          What I wanted the concept to show is that the recurring portion of
          this work is genuinely automatable now — with proper respect for
          the failure modes of language models and the integrity requirements
          of financial data. This stopped being a research problem. It&apos;s
          an engineering problem, and a{" "}
          <span className="accent-serif">solvable</span> one.
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
