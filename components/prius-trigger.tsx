"use client";

/** The about page's "2nd-gen Prius" — click it and it drives by. */
export function PriusTrigger() {
  return (
    <button
      type="button"
      aria-label="start the prius"
      onClick={() => window.dispatchEvent(new Event("drive-prius"))}
      className="cursor-pointer border-b border-dashed border-faint transition-colors duration-300 hover:border-fg"
    >
      2nd-gen Prius
    </button>
  );
}
