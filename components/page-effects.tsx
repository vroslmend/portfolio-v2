"use client";

import { useEffect } from "react";

export function PageEffects() {
  useEffect(() => {
    console.log(
      "%chello, fellow dev — view source all you like.\n%c→ github.com/vroslmend",
      "font-family:monospace;color:#a8a49c",
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
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
