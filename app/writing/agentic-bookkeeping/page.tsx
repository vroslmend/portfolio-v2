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
              className={`absolute -left-[4px] top-[9px] size-[7px] rounded-full ${
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
            Earlier this year I talked with a US accounting firm about how they
            handle their clients&apos; bookkeeping. Afterwards I wrote up a short
            architecture concept for them: how much of the routine monthly work
            could AI agents realistically take on today, without ignoring the
            ways they fail. This is that writeup.
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
          Most of those first three steps follow rules you can learn. A vendor
          gets filed under the same category every month. A certain pattern
          always means a transfer. A certain odd transaction always deserves a
          second look. The useful idea is to hand the rule-based parts to
          software, so people spend their time on the parts that actually need
          judgment.
        </p>
      </Section>

      <Section n="02" title="The shape of the system">
        <p className="text-pretty">
          Three agents working together, and one human approval gate. The
          accounting platform stays the system of record, and no agent writes to
          it directly. Every entry goes through a person first.
        </p>
        <PipelineDiagram />
        <p className="text-pretty">
          The first agent categorizes. For each transaction it looks at history
          before it asks the model anything: a vector lookup over how the client
          has categorized things before, so a vendor that has been filed the
          same way fifty times doesn&apos;t need the model on the fifty-first.
          Only genuinely new transactions go to the language model. It gets the
          transaction, the chart of accounts, and the closest past examples, and
          returns a category with a confidence score. High confidence goes into
          the approval queue. Low confidence gets flagged for a person to
          decide.
        </p>
        <p className="text-pretty">
          The second agent reconciles. It matches the recorded entries against
          the bank statement and flags anything missing, duplicated, or off by
          some amount. The third reads the closed period and compares it to
          earlier ones, then produces a list of exceptions sorted by how much
          they matter: a category that suddenly tripled, a payroll account that
          went quiet in a month that had payroll, a round number sitting where
          the amounts are usually messy.
        </p>
        <p className="text-pretty">
          The reviewer sees all of it in one dashboard: the proposed category,
          the confidence, the reasoning, and buttons to approve, edit, or
          reject. Instead of categorizing hundreds of routine transactions,
          bookkeepers review a short list of flagged ones, and there&apos;s a
          full audit trail of what was decided and why.
        </p>
      </Section>

      <Section n="03" title="The decisions that matter">
        <p className="text-pretty">
          <b className="font-medium text-fg">
            The language model never touches arithmetic.
          </b>{" "}
          Language models are text predictors, and they are well known for
          getting arithmetic wrong. In bookkeeping a single wrong sum can mean a
          misfiled return. So the split is enforced in the code. The model reads
          descriptions, matches vendors, and explains its choices. Plain Python
          does every sum, every balance check, and every match. If the debits
          and credits don&apos;t balance, the pipeline stops. No number that
          reaches the books was written by the AI. This is the most important
          decision in the whole design.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">
            The approval gate is code, not a policy.
          </b>{" "}
          The orchestration layer actually pauses before any write and only
          continues once a person approves, even when the model is fully
          confident. Relaxing that later, for a few narrow categories the
          accountants trust, is their call to make, not the software&apos;s.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">A boring database, on purpose.</b>{" "}
          Decisions, approvals, and writes are stored in PostgreSQL, because
          financial records need ACID guarantees: a write either fully commits
          or doesn&apos;t happen at all. The same database also handles the
          vector search for the history lookups, so the system keeps learning
          from every approved categorization. The more history it has, the more
          accurate it gets, and the less it has to call the model.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">
            Client data never leaves the firm.
          </b>{" "}
          The model is reached through the firm&apos;s own cloud provider instead
          of a public AI API, so the financial data stays inside their
          infrastructure and nothing is kept for training. For a licensed firm
          with confidentiality obligations, that isn&apos;t optional.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">
            Work with the APIs you actually have.
          </b>{" "}
          The main accounting platform doesn&apos;t expose bank-feed data
          through its public API, so the pipeline takes that data from the
          source instead, either CSV exports or a bank-data provider, and writes
          the approved entries back through the standard API. And since real
          client lists are never all on one platform, the agents don&apos;t
          assume one. They produce structured journal entries, and a separate
          integration layer translates those for each destination.
        </p>
      </Section>

      <Section n="04" title="Limits">
        <p className="text-pretty">
          The design covers the high-volume, repetitive work: categorization,
          reconciliation, and review. It doesn&apos;t try to handle multi-entity
          consolidations, sales tax, foreign currency, or the entries that never
          come from a bank feed, like depreciation, payroll allocations, and
          amortization. The QA agent would notice those are missing, but it
          wouldn&apos;t create them. And none of this touches professional
          judgment. GAAP questions, audit defense, and tax planning stay with
          people.
        </p>
      </Section>

      <Section n="05" title="Closing">
        <p className="text-pretty">
          What I wanted the concept to show is that the routine part of this
          work really can be automated now, as long as you respect how language
          models fail and how strict financial data has to be. It isn&apos;t a
          research problem anymore. It&apos;s an engineering one, and a{" "}
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
