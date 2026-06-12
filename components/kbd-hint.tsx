"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Shows the command-menu shortcut with the right modifier for the visitor's OS. */
export function KbdHint() {
  const modifier = useSyncExternalStore(
    emptySubscribe,
    () => (/mac|iphone|ipad/i.test(navigator.userAgent) ? "⌘" : "ctrl"),
    () => null
  );

  if (!modifier) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-cmdk"))}
      title="open command menu"
      className="hidden cursor-pointer items-center gap-1 transition-colors duration-300 hover:text-muted sm:inline-flex"
    >
      <kbd className="rounded border border-line px-[5px] py-px font-mono text-[10px]">
        {modifier}
      </kbd>
      <kbd className="rounded border border-line px-[5px] py-px font-mono text-[10px]">
        k
      </kbd>
    </button>
  );
}
