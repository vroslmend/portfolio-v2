"use client";

/** The about page's "Prius in the driveway" — click it and it drives by. */
export function PriusTrigger() {
  return (
    <button
      type="button"
      aria-label="start the prius"
      onClick={() => window.dispatchEvent(new Event("drive-prius"))}
      className="cursor-pointer border-b border-dashed border-faint transition-colors duration-300 hover:border-fg"
    >
      Prius in the driveway
    </button>
  );
}
