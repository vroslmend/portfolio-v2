"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Magnetic } from "@/components/magnetic";
import { site } from "@/data/site";

const links = [
  { href: "/work", label: "work" },
  { href: "/about", label: "about" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/75 backdrop-blur-md transition-colors duration-500">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Magnetic strength={0.2}>
          <Link
            href="/"
            className="font-mono text-[13px] tracking-tight text-fg"
          >
            {site.wordmark}
          </Link>
        </Magnetic>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Magnetic key={l.href} strength={0.2}>
              <Link
                href={l.href}
                data-active={pathname === l.href}
                className="u-link font-mono text-xs tracking-[0.08em] text-muted transition-colors duration-300 hover:text-fg data-[active=true]:text-fg"
              >
                {l.label}
              </Link>
            </Magnetic>
          ))}
          <Magnetic strength={0.2}>
            <a
              href={site.links.resume}
              download="Ammar-Hassan_Resume.pdf"
              className="u-link font-mono text-xs tracking-[0.08em] text-muted transition-colors duration-300 hover:text-fg"
            >
              resume
            </a>
          </Magnetic>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
