import type { Metadata } from "next";
import Link from "next/link";
import { ReadingProgress } from "@/components/reading-progress";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "a visitor counter, taken too seriously — ammar hassan",
  description:
    "Why I wrapped a trivial visitor counter in Terraform, a keyless CI/CD pipeline, and atomic writes. A deliberately small take on the Cloud Resume Challenge.",
};

type Step = { label: string; note: string; emphasis?: boolean };

const requestPath: Step[] = [
  { label: "browser", note: "the page on ammarhassan.dev" },
  { label: "api gateway", note: "http api, cors locked to the site" },
  { label: "lambda", note: "python, reads or increments atomically", emphasis: true },
  { label: "dynamodb", note: "two rows: visits, prius" },
];

const deployPath: Step[] = [
  { label: "git push", note: "to main" },
  { label: "github actions", note: "runs the tests first" },
  { label: "oidc handshake", note: "short-lived token ⇄ temporary aws credentials", emphasis: true },
  { label: "terraform apply", note: "from shared state in s3" },
  { label: "aws", note: "infrastructure updated" },
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

export default function VisitorCounterEssay() {
  return (
    <article className="flex flex-col gap-10 pb-8">
      <ReadingProgress />
      <header className="flex flex-col gap-5">
        <Reveal mask>
          <p className="select-none font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            writing — june 2026 · 6 min
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="max-w-[24ch] text-[26px] font-medium leading-[1.25] tracking-tight text-fg sm:text-[32px]">
            A visitor counter, taken{" "}
            <span className="accent-serif">too seriously</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            At the bottom of this site there are two numbers: how many people
            have visited, and how many times the Prius easter egg has been
            driven. The numbers don&apos;t really matter. What I want to write
            about is everything I put behind them, and the one thing I left out.
          </p>
        </Reveal>
      </header>

      <Section n="01" title="The toy">
        <p className="text-pretty">
          It&apos;s just a counter, and I should be upfront that the numbers
          barely mean anything. The visit count is fuzzy on purpose. It counts
          once per browser session, with no cookies and no analytics, so
          really it&apos;s an integer that goes up. If I only wanted the number,
          I could have done it with one line of serverless storage in an
          afternoon.
        </p>
        <p className="text-pretty">
          So the number wasn&apos;t the goal. I wanted to take the smallest
          backend I could think of and build a proper, production-style setup
          around it. A counter is small enough that none of the cloud parts get
          tangled up in the app itself, which is exactly why it&apos;s a good
          thing to practice on. It&apos;s a stripped-down version of the{" "}
          <span className="accent-serif">Cloud Resume Challenge</span>: skip the
          resume, keep the counter, and take it much further than a counter
          needs.
        </p>
      </Section>

      <Section n="02" title="The shape of the system">
        <p className="text-pretty">A request goes through four steps.</p>
        <Flow
          steps={requestPath}
          label="Request path: the browser calls API Gateway, which triggers a Lambda function, which reads or increments a counter in DynamoDB"
          caption="fig. 01 — one request, four steps. the increment is atomic"
        />
        <p className="text-pretty">
          The browser calls an API Gateway endpoint. That runs a small Python
          function on Lambda. The function reads or updates a number in
          DynamoDB and sends it back. There are two counters, stored as two
          rows in one table: one called <code>visits</code>, one called{" "}
          <code>prius</code>. The prius one is wired into the existing easter
          egg, so driving it bumps the count.
        </p>
        <p className="text-pretty">
          A few details I cared about. The increment is a single atomic
          DynamoDB <code>ADD</code> that happens inside the database, not a
          read-then-write in the function. CORS only allows this site. The
          function&apos;s permissions are as narrow as I could make them: it can
          read and update one table and write its own logs, and that&apos;s it.
          It runs in the Mumbai region because that&apos;s closest to me in
          Lahore, and the billing is pay-per-request, which at this traffic is
          basically free.
        </p>
      </Section>

      <Section n="03" title="The choices">
        <p className="text-pretty">
          <b className="font-medium text-fg">
            I didn&apos;t host the site on AWS.
          </b>{" "}
          The original Cloud Resume Challenge puts the whole resume on S3,
          CloudFront, and Route 53. I skipped all of that on purpose. This site
          isn&apos;t a static page, it&apos;s a Next.js app, and Vercel already
          runs it well. I didn&apos;t want to rebuild a CDN and caching by hand
          just to say I used more AWS services. So I only moved the part that
          actually needed a backend, the counter, and left everything else
          where it was. Picking the smaller scope was the first real decision,
          and I still think it was the right call.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">
            There are no AWS keys saved in GitHub.
          </b>{" "}
          The simple way to let GitHub deploy to AWS is to store an access key
          as a secret in the repo. I didn&apos;t want a long-lived key sitting
          there that would keep working if it ever leaked. So instead GitHub and
          AWS check each other on every run. GitHub hands over a short-lived
          token that proves the request is coming from this exact repo, AWS
          matches it against a rule that only trusts that repo, and gives back
          credentials that expire after an hour. Nothing secret is saved
          anywhere. This is called OIDC. It was more work to set up, and
          it&apos;s the part I&apos;m happiest I didn&apos;t cut.
        </p>
        <Flow
          steps={deployPath}
          label="Deploy path: a push to main triggers GitHub Actions, which exchanges an OIDC token for temporary AWS credentials, then runs terraform apply"
          caption="fig. 02 — every deploy logs in with no stored keys"
        />
        <p className="text-pretty">
          <b className="font-medium text-fg">The pipeline is the real project.</b>{" "}
          All of the infrastructure is written in Terraform: the table, the
          function, the API, the permissions, even the trust setup that lets
          GitHub log in. I can tear the whole thing down with one command and
          bring it back exactly the same. The Terraform state lives in S3 so my
          machine and GitHub use the same copy. Pushing to <code>main</code>{" "}
          runs the tests and then applies the changes. Opening a pull request
          runs the tests and shows a plan of what would change, without changing
          anything. The counter has been done for weeks. The pipeline around it
          is the part I&apos;d actually show someone.
        </p>
        <p className="text-pretty">
          <b className="font-medium text-fg">
            The writes are atomic, because that&apos;s a real bug.
          </b>{" "}
          If two people hit the bottom at the same moment, a naive
          read-add-write would have both of them read the same number and both
          write back the same value, and you&apos;d lose a visit. The DynamoDB{" "}
          <code>ADD</code> does the whole increment in one step inside the
          database, so that can&apos;t happen. It&apos;s more than a counter
          needs. But a counter is a cheap place to build the habit, before it
          matters somewhere it does.
        </p>
      </Section>

      <Section n="04" title="Limits">
        <p className="text-pretty">
          It only counts, and the limits are on purpose. Visits are per browser
          session, not per person, so clearing your storage or opening another
          browser counts you again. I&apos;m fine with that. Counting real
          people means cookies and consent banners, and this number isn&apos;t
          worth that. There&apos;s no login, because the only thing you can do
          is add one to two fixed keys, and the function refuses anything else.
          You could probably inflate the number if you really wanted to. At this
          scale I don&apos;t mind.
        </p>
      </Section>

      <Section n="05" title="Closing">
        <p className="text-pretty">
          This is sort of the opposite of the last thing I wrote. In the{" "}
          <Link
            href="/writing/agentic-bookkeeping"
            className="u-link text-fg hover:text-muted"
          >
            bookkeeping piece
          </Link>{" "}
          I argued against over-building, because the data was small enough that
          a vector database would have been pointless. Here I wrapped a counter
          in remote state, federated login, and infrastructure-as-code, which is
          far more than the number is worth.
        </p>
        <p className="text-pretty">
          To me it&apos;s the same idea, though: use about as much machinery as
          the job actually calls for. The bookkeeping system has to be trusted
          with money, so the effort went into safety checks. This counter just
          had to show I can build and run a small cloud service properly from
          start to finish, so the effort went into the setup, and the counter is
          there to give it something to do. Most of the skill is{" "}
          <span className="accent-serif">telling those two apart</span>.
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
