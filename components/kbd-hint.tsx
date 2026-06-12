"use client";

import { useEffect, useState } from "react";

/** Shows the command-menu shortcut with the right modifier for the visitor's OS. */
export function KbdHint() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const isMac = /mac|iphone|ipad/i.test(navigator.userAgent);
    setLabel(isMac ? "⌘ k" : "ctrl k");
  }, []);

  if (!label) return null;

  return <span className="hidden sm:inline">{label}</span>;
}
