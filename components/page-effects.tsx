"use client";

import { useEffect } from "react";

export function PageEffects() {
  useEffect(() => {
    const kbd = /mac|iphone|ipad/i.test(navigator.userAgent) ? "⌘ k" : "ctrl k";
    console.log(
      `%chello, fellow dev, view source all you like.\n%c→ github.com/vroslmend\n%cpsst: press ${kbd} and type 'prius'.`,
      "font-family:monospace;color:#a8a49c",
      "font-family:monospace;color:#5c5953",
      "font-family:monospace;color:#5c5953"
    );

    const original = document.title;
    function onBlur() {
      document.title = "come back :)";
    }
    function onFocus() {
      document.title = original;
    }
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    // warm the prius sprite so its first drive never pops in mid-animation
    const priusId = setTimeout(() => {
      const img = new window.Image();
      img.src = "/prius.png";
    }, 300);

    return () => {
      clearTimeout(priusId);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
