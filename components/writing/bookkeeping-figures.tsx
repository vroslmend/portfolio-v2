import { DiagramNode } from "@/components/writing/diagram";
import { EssayFigure } from "@/components/writing/essay";

const stages = [
  {
    owner: "categorize agent",
    focus: "history first; model when unfamiliar",
    detail: "category · confidence · reasoning",
  },
  {
    owner: "reconcile agent",
    focus: "deterministic matching and math",
    detail: "missing · duplicated · out of balance",
  },
  {
    owner: "QA agent",
    focus: "review the closed period",
    detail: "exceptions ranked by severity",
  },
  {
    owner: "human review",
    focus: "approve · edit · reject",
    detail: "the only path to integration",
  },
];

export function BookkeepingSystemFigure() {
  return (
    <EssayFigure caption="fig. 01 — three agents prepare the work; a person controls what reaches the ledger">
      <div
        role="img"
        aria-label="Bank and card data passes through a categorization agent, a deterministic reconciliation agent, and a quality assurance agent. A human then approves, edits, or rejects the proposed entries. Only approved structured entries pass through the integration layer into the ledger."
        className="border-y border-line py-5"
      >
        <div className="grid gap-3 sm:grid-cols-[0.7fr_2.1rem_1.7fr] sm:items-center">
          <DiagramNode label="source data" detail="bank feed · card feed · CSV" />
          <div className="text-center font-mono text-[10px] text-muted">
            <span className="sm:hidden">↓</span>
            <span className="hidden sm:inline">→</span>
          </div>
          <div className="border border-line">
            <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
                monthly close
              </p>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                three agents + one gate
              </span>
            </div>
            <div className="divide-y divide-line">
              {stages.map((stage, index) => (
                <div
                  key={stage.owner}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[1.1fr_1.5fr] sm:gap-4"
                >
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                      0{index + 1} · {stage.owner}
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-fg">
                      {stage.focus}
                    </p>
                  </div>
                  <p className="text-[12px] leading-[1.45] text-muted">
                    {stage.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto h-5 border-l border-line" />
        <div className="grid items-stretch sm:grid-cols-[1fr_2.5rem_1fr]">
          <DiagramNode
            label="integration layer"
            detail="translates approved structured entries"
          />
          <div className="flex items-center justify-center font-mono text-[10px] text-muted">
            <span className="sm:hidden">↓</span>
            <span className="hidden sm:inline">→</span>
          </div>
          <DiagramNode label="ledger" detail="system of record" strong />
        </div>
      </div>
    </EssayFigure>
  );
}

export function BookkeepingBoundaryFigure() {
  return (
    <EssayFigure caption="fig. 02 — the model can propose; code and a person control every committed number">
      <div
        role="img"
        aria-label="The language model may read descriptions and past examples and propose a category, confidence and explanation. It cannot perform ledger arithmetic or write to the ledger. Deterministic checks must pass and a human must approve before the integration layer can commit an entry."
        className="border-y border-line py-5"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_5.5rem_1fr] sm:gap-0">
          <div className="border border-dashed border-faint p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              proposal space
            </p>
            <p className="mt-1 text-[11px] text-muted">model-assisted judgment</p>
            <div className="mt-4 grid gap-2">
              <DiagramNode label="may read" detail="description · history · chart" />
              <DiagramNode
                label="may propose"
                detail="category · confidence · reason"
                strong
              />
            </div>
          </div>

          <div className="flex min-h-20 flex-col items-center justify-center gap-2 px-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            <span className="sm:hidden">structured proposal ↓</span>
            <span className="hidden sm:block">proposal →</span>
            <span className="h-px w-full border-t border-dashed border-faint sm:block" />
            <span>hard gate</span>
          </div>

          <div className="border border-faint p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
              commit space
            </p>
            <p className="mt-1 text-[11px] text-muted">deterministic + human authority</p>
            <div className="mt-4 grid gap-2">
              <DiagramNode label="code verifies" detail="math · match · balance" />
              <DiagramNode label="person decides" detail="approve · edit · reject" strong />
              <DiagramNode label="integration writes" detail="approved entry only" />
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="border border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            model → ledger arithmetic&nbsp; <span className="text-fg">blocked</span>
          </div>
          <div className="border border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted sm:text-right">
            model → direct write&nbsp; <span className="text-fg">blocked</span>
          </div>
        </div>
      </div>
    </EssayFigure>
  );
}
