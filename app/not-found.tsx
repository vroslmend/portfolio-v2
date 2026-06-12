import Link from "next/link";
import { Reveal } from "@/components/reveal";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Reveal mask>
        <h1 className="font-mono text-[13px] tracking-[0.12em] text-faint">
          404
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="text-[19px] text-fg">
          this page doesn&apos;t exist.
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <Link
          href="/"
          className="u-link w-fit font-mono text-[11px] tracking-[0.12em] text-muted hover:text-fg"
        >
          → home
        </Link>
      </Reveal>
    </div>
  );
}
