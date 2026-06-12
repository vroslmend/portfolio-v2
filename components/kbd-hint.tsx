"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Shows the command-menu shortcut with the right modifier for the visitor's OS. */
export function KbdHint() {
  const label = useSyncExternalStore(
    emptySubscribe,
    () => (/mac|iphone|ipad/i.test(navigator.userAgent) ? "⌘ k" : "ctrl k"),
    () => null
  );

  if (!label) return null;

  return <span className="hidden sm:inline">{label}</span>;
}
