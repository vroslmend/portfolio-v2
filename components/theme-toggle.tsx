"use client";

import { useRef, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const ref = useRef<HTMLButtonElement>(null);

  function toggle() {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<unknown> };
    };

    if (
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(next);
      return;
    }

    const rect = ref.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const cy = rect ? rect.top + rect.height / 2 : 30;
    // small overshoot so the farthest corner is fully covered before the
    // reveal ends; otherwise the last uncovered sliver swaps in instantly
    const radius =
      Math.hypot(
        Math.max(cx, window.innerWidth - cx),
        Math.max(cy, window.innerHeight - cy)
      ) * 1.05;

    // hand the circle's origin + radius to the CSS @keyframes
    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${cx}px`);
    root.style.setProperty("--vt-y", `${cy}px`);
    root.style.setProperty("--vt-r", `${radius}px`);
    // scope the circular reveal to this transition only (see globals.css)
    root.classList.add("theme-vt");

    const transition = doc.startViewTransition(() => setTheme(next));

    // Chromium drops backdrop-filter while rendering the VT snapshot, so the
    // glass nav's blur snaps back hard the instant the reveal ends. Ease it
    // back to its resting blur(12px) instead — leaves the rest of the swap as
    // is, just smooths that one jarring return.
    transition.finished.then(() => {
      root.classList.remove("theme-vt");
      document
        .querySelector("header")
        ?.animate(
          [{ backdropFilter: "blur(0px)" }, { backdropFilter: "blur(12px)" }],
          { duration: 450, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
    });
  }

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      ref={ref}
      onClick={toggle}
      aria-label="toggle theme"
      className="group relative grid size-7 place-items-center text-muted transition-[color,transform] duration-300 hover:text-fg active:scale-90"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="size-[15px] transition-transform duration-700 ease-out-expo group-hover:rotate-45"
        suppressHydrationWarning
      >
        {isDark ? (
          /* moon */
          <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z" suppressHydrationWarning />
        ) : (
          /* sun */
          <>
            <circle cx="12" cy="12" r="4" suppressHydrationWarning />
            <path
              d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"
              suppressHydrationWarning
            />
          </>
        )}
      </svg>
    </button>
  );
}
