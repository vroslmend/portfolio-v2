/**
 * Rows that react to hover shouldn't react to the page scrolling under a
 * resting cursor. While the page scrolls, <html> carries .hover-paused, and
 * the class only comes off once the mouse itself moves. Browsers re-run hover
 * on scroll without changing the pointer's position, so a move only counts
 * when the coordinates actually change.
 */
let installed = false;

export function installHoverIntent() {
  if (installed) return;
  installed = true;
  const root = document.documentElement;
  let lastX = -1;
  let lastY = -1;
  window.addEventListener(
    "scroll",
    () => root.classList.add("hover-paused"),
    { passive: true }
  );
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      if (e.clientX === lastX && e.clientY === lastY) return;
      lastX = e.clientX;
      lastY = e.clientY;
      root.classList.remove("hover-paused");
    },
    { passive: true }
  );
}

export const hoverPaused = () =>
  document.documentElement.classList.contains("hover-paused");
