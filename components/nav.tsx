"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Magnetic } from "@/components/magnetic";
import { site } from "@/data/site";

const links = [
  { href: "/work", label: "work" },
  { href: "/about", label: "about" },
  { href: "/writing", label: "writing" },
];

export function Nav() {
  const pathname = usePathname();
  const lenis = useLenis();

  // clicking the link for the page you're already on smooth-scrolls to top
  // (route changes are handled by SmoothScroll's scroll-to-top instead)
  const toTopIfHere = (href: string) => (e: React.MouseEvent) => {
    if (pathname === href) {
      e.preventDefault();
      lenis?.scrollTo(0, { duration: 1 });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/75 backdrop-blur-md transition-colors duration-500">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Magnetic strength={0.2}>
          <Link
            href="/"
            aria-label="ammar hassan — home"
            onClick={toTopIfHere("/")}
            className="group block py-1 text-fg"
          >
            <Logo className="h-4.25 w-auto translate-y-[4.5px]" />
          </Link>
        </Magnetic>
        <div className="flex items-center gap-3.5 sm:gap-6">
          {links.map((l) => (
            <Magnetic key={l.href} strength={0.2}>
              <Link
                href={l.href}
                onClick={toTopIfHere(l.href)}
                data-active={
                  pathname === l.href || pathname.startsWith(`${l.href}/`)
                }
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
