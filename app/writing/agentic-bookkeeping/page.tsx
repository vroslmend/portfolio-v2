import type { Metadata } from "next";
import {
  EssayFooter,
  EssayHeader,
  EssaySection,
} from "@/components/writing/essay";
import { EssayShell } from "@/components/writing/essay-shell";
import {
  BookkeepingBoundaryFigure,
  BookkeepingSystemFigure,
} from "@/components/writing/bookkeeping-figures";

export const metadata: Metadata = {
  title: "agents that do bookkeeping · ammar hassan",
  description:
    "An architecture for automating recurring bookkeeping work with AI agents, a deterministic core, and a hard human approval gate.",
};

export default function AgenticBookkeepingEssay() {
  return (
    <EssayShell>
      <EssayHeader
        eyebrow="writing — may 2026 · 6 min"
        title={
          <>
            Agents that do bookkeeping, with humans{" "}
            <span className="accent-serif">where it matters</span>
          </>
        }
      >
        Earlier this year I talked with a US accounting firm about how they
        handle their clients&apos; bookkeeping. Afterwards I wrote up a short
        architecture concept for them: how much of the routine monthly work
        could AI agents realistically take on today, without ignoring the ways
        they fail. This is that writeup.
      </EssayHeader>

      <EssaySection n="01" title="The work">
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
      </EssaySection>

      <EssaySection n="02" title="The shape of the system">
        <p className="text-pretty">
          Three agents working together, and one human approval gate. The
          accounting platform stays the system of record, and no agent writes to
          it directly. Every entry goes through a person first.
        </p>
        <BookkeepingSystemFigure />
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
      </EssaySection>

      <EssaySection n="03" title="The decisions that matter">
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
        <BookkeepingBoundaryFigure />
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
      </EssaySection>

      <EssaySection n="04" title="Limits">
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
      </EssaySection>

      <EssaySection n="05" title="Closing">
        <p className="text-pretty">
          What I wanted the concept to show is that the routine part of this
          work really can be automated now, as long as you respect how language
          models fail and how strict financial data has to be. It isn&apos;t a
          research problem anymore. It&apos;s an engineering one, and a{" "}
          <span className="accent-serif">solvable</span> one.
        </p>
      </EssaySection>

      <EssayFooter />
    </EssayShell>
  );
}
