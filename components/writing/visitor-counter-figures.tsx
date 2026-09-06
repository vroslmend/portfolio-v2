import { DiagramNode } from "@/components/writing/diagram";
import { EssayFigure } from "@/components/writing/essay";

function Arrow({ children }: { children: string }) {
  return (
    <div className="flex min-h-10 items-center justify-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
      <span className="sm:hidden">↓ {children}</span>
      <span className="hidden sm:inline">{children} →</span>
    </div>
  );
}

export function CounterTopologyFigure() {
  return (
    <EssayFigure caption="fig. 01 — the site stays on Vercel; only the counter crosses into AWS">
      <div
        role="img"
        aria-label="The portfolio browser sends a counter request across an API boundary into AWS. API Gateway invokes a narrowly permitted Lambda function, which performs an atomic ADD inside DynamoDB and returns the counter value."
        className="grid items-center gap-3 border-y border-line py-5 sm:grid-cols-[0.7fr_4rem_1.65fr] sm:gap-0"
      >
        <div>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
            portfolio · Vercel
          </p>
          <DiagramNode label="browser" detail="counter request from the page" />
        </div>

        <div className="flex flex-col items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
          <span className="sm:hidden">request ↓</span>
          <span className="hidden sm:block">request →</span>
          <span className="hidden h-px w-full bg-line sm:block" />
          <span className="hidden sm:block">← value</span>
        </div>

        <div className="border border-line p-4">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
              AWS boundary
            </p>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
              least privilege
            </span>
          </div>

          <div className="grid items-stretch sm:grid-cols-[1fr_2.5rem_1fr_2.5rem_1fr]">
            <DiagramNode label="API Gateway" detail="HTTP API · site-only CORS" />
            <Arrow>invoke</Arrow>
            <DiagramNode
              label="Lambda"
              detail="Python · one-table permission"
              strong
            />
            <Arrow>ADD</Arrow>
            <DiagramNode label="DynamoDB" detail="visits · prius" />
          </div>

          <div className="mt-3 border border-dashed border-faint px-3 py-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
            atomic inside DynamoDB · no read–modify–write race
          </div>
        </div>
      </div>
    </EssayFigure>
  );
}

export function CounterDeployFigure() {
  return (
    <EssayFigure caption="fig. 02 — repository identity becomes a temporary AWS session, never a stored key">
      <div
        role="img"
        aria-label="A push to main starts a GitHub Actions job that tests and prepares a Terraform change. GitHub presents an OIDC identity to an AWS trust policy. AWS STS returns temporary credentials, which authorize Terraform to update the infrastructure. No AWS access key is stored in GitHub."
        className="border-y border-line py-5"
      >
        <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_5.5rem_1fr] sm:gap-0">
          <div className="border border-line p-4">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
                GitHub
              </p>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                exact repo
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <DiagramNode label="push to main" detail="starts the workflow" />
              <div className="text-center font-mono text-[10px] text-faint">↓</div>
              <DiagramNode
                label="Actions job"
                detail="test · terraform plan / apply"
                strong
              />
            </div>
          </div>

          <div className="flex min-h-20 flex-col items-center justify-center gap-1 px-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
            <span className="hidden sm:block">OIDC token →</span>
            <span className="sm:hidden">OIDC token ↓</span>
            <span className="h-px w-full bg-line sm:block" />
            <span className="hidden sm:block">← temp creds</span>
            <span className="sm:hidden">temp creds ↑</span>
          </div>

          <div className="border border-line p-4">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
                AWS
              </p>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                trust boundary
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <DiagramNode label="IAM trust rule" detail="validates repo identity" />
              <div className="text-center font-mono text-[10px] text-faint">↓</div>
              <DiagramNode label="STS session" detail="short-lived credentials" strong />
              <div className="text-center font-mono text-[10px] text-faint">↓</div>
              <DiagramNode label="AWS resources" detail="updated by Terraform" />
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="border border-dashed border-faint px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
            stored AWS access key&nbsp; — &nbsp;none
          </div>
          <div className="border border-line bg-surface px-3 py-2 text-right font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            session authorizes this run only
          </div>
        </div>
      </div>
    </EssayFigure>
  );
}
