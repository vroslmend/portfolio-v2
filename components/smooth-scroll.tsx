"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";

// Lenis takes over scrolling, which suppresses Next's default scroll-to-top on
// navigation, so you'd land mid-page on the page you just opened. Snap to the
// top whenever the route actually changes (not on first mount/refresh, so a
// refresh keeps your place).
function ScrollTopOnNavigate() {
  const lenis = useLenis();
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (!lenis || pathname === lastPath.current) return;
    lastPath.current = pathname;
    lenis.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.12, duration: 1.1 }}>
      <ScrollTopOnNavigate />
      {children}
    </ReactLenis>
  );
}
