"use client";

import { useEffect, useState } from "react";

type Film = "clean" | "fine" | "16mm" | "nocturne";
type Typography = "geist" | "editorial" | "roman" | "hybrid";
type TextMotion = "still" | "drift" | "depth" | "gate";
type Ground = "off" | "arcs" | "ramp" | "vignette";
type GroundAmount = "quarter" | "half" | "1x" | "2x";
type GroundDither = "off" | "low" | "on" | "high";
type GroundAttach = "fixed" | "scroll";

type LabState = {
  film: Film;
  typography: Typography;
  textMotion: TextMotion;
  ground: Ground;
  groundAmount: GroundAmount;
  groundDither: GroundDither;
  groundAttach: GroundAttach;
};

const STORAGE_KEY = "portfolio-design-lab-v4";
// The defaults reproduce what is on main today, so the lab always opens on the
// control and every switch is a comparison against the shipped page.
const DEFAULTS: LabState = {
  film: "fine",
  typography: "geist",
  textMotion: "still",
  ground: "arcs",
  groundAmount: "1x",
  groundDither: "on",
  groundAttach: "fixed",
};

const FILMS: { value: Film; label: string; title: string }[] = [
  { value: "clean", label: "clean", title: "The lightest grain that still reads as film" },
  { value: "fine", label: "fine", title: "Balanced 35mm grain" },
  { value: "16mm", label: "16mm", title: "Coarser grain with sparse exposure flicker" },
  { value: "nocturne", label: "night", title: "Fine grain under a slow monochrome halation" },
];

const TYPES: { value: Typography; label: string; title: string }[] = [
  { value: "geist", label: "geist", title: "Sans display type throughout" },
  { value: "editorial", label: "italic", title: "Newsreader italic across the display layer" },
  { value: "roman", label: "roman", title: "Newsreader upright, quieter than the italic" },
  { value: "hybrid", label: "hybrid", title: "Sans name with a serif italic surname" },
];

const MOTIONS: { value: TextMotion; label: string; title: string }[] = [
  { value: "still", label: "still", title: "Only the existing entrance and scroll motion" },
  { value: "drift", label: "drift", title: "The opening plate floats, as if hand held" },
  { value: "depth", label: "depth", title: "The plate answers the pointer and a key light follows it" },
  { value: "gate", label: "gate", title: "Projector weave on the grain's frame cadence" },
];

const GROUNDS: { value: Ground; label: string; title: string }[] = [
  { value: "off", label: "off", title: "Flat --bg. The film grain is the only texture on the page" },
  { value: "arcs", label: "arcs", title: "Shipped: two ellipses, a lift at the top and a sink at the bottom" },
  { value: "ramp", label: "ramp", title: "One edge-to-edge vertical ramp. No centre and no rim, so there is no shape to notice" },
  { value: "vignette", label: "vign", title: "Darkening at the frame edges only, like a lens. Leaves the middle alone" },
];

const GROUND_AMOUNTS: { value: GroundAmount; label: string; title: string }[] = [
  { value: "quarter", label: "¼", title: "A quarter strength: about 1 level of swing top to bottom" },
  { value: "half", label: "½", title: "Half strength: about 2.5 levels" },
  { value: "1x", label: "1×", title: "Shipped strength: about 5 levels of swing, ~2% of the tonal range" },
  { value: "2x", label: "2×", title: "Double: about 10 levels. Deliberately too much, to see where the ceiling is" },
];

const GROUND_DITHERS: { value: GroundDither; label: string; title: string }[] = [
  { value: "off", label: "off", title: "No dither. Shows the raw banding the ground produces on its own" },
  { value: "low", label: "low", title: "Half the shipped dither" },
  { value: "on", label: "on", title: "Shipped: about ±1.5 levels, roughly one quantisation step" },
  { value: "high", label: "high", title: "Double. Starts reading as texture rather than as dither" },
];

const GROUND_ATTACHES: { value: GroundAttach; label: string; title: string }[] = [
  { value: "fixed", label: "fixed", title: "Shipped: pinned to the viewport, so it stays put while the page scrolls under it" },
  { value: "scroll", label: "scroll", title: "Spans the document and travels with the content, so it stops reading as an overlay on the glass" },
];

function isLabState(value: unknown): value is LabState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<LabState>;
  return (
    FILMS.some((option) => option.value === state.film) &&
    TYPES.some((option) => option.value === state.typography) &&
    MOTIONS.some((option) => option.value === state.textMotion) &&
    GROUNDS.some((option) => option.value === state.ground) &&
    GROUND_AMOUNTS.some((option) => option.value === state.groundAmount) &&
    GROUND_DITHERS.some((option) => option.value === state.groundDither) &&
    GROUND_ATTACHES.some((option) => option.value === state.groundAttach)
  );
}

export function BackgroundTexture() {
  const [settings, setSettings] = useState<LabState>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let saved = DEFAULTS;
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
      if (isLabState(parsed)) saved = parsed;
    } catch {
      // The lab still works for this page load if storage is unavailable.
    }

    const frame = requestAnimationFrame(() => {
      setSettings(saved);
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.dataset.film = settings.film;
    root.dataset.typography = settings.typography;
    root.dataset.textMotion = settings.textMotion;
    root.dataset.ground = settings.ground;
    root.dataset.groundAmount = settings.groundAmount;
    root.dataset.groundDither = settings.groundDither;
    root.dataset.groundAttach = settings.groundAttach;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Persistence is optional; the comparison itself remains functional.
    }
  }, [hydrated, settings]);

  // The key light is the only site-wide pointer effect, so it is the only
  // listener: one rAF-coalesced write of two custom properties, and nothing at
  // all on touch devices or under reduced motion.
  useEffect(() => {
    if (settings.textMotion !== "depth") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    let frame = 0;
    let x = 0;
    let y = 0;

    function onMove(event: PointerEvent) {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--px", `${x}px`);
        root.style.setProperty("--py", `${y}px`);
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
      root.style.removeProperty("--px");
      root.style.removeProperty("--py");
    };
  }, [settings.textMotion]);

  // `g` cycles the ground shape from anywhere on the page. The whole question
  // is what you notice while reading and scrolling normally, and reaching for a
  // panel in the corner is exactly the moment you stop doing that.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "g" && event.key !== "G") return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      setSettings((current) => {
        const i = GROUNDS.findIndex((option) => option.value === current.ground);
        return { ...current, ground: GROUNDS[(i + 1) % GROUNDS.length].value };
      });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function update<K extends keyof LabState>(key: K, value: LabState[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <div aria-hidden className="film-atmosphere" />
      <div aria-hidden className="pointer-light" />
      {/* The dither rides as its own layer here rather than as a background
          layer inside the ground (which is how main ships it), purely so the
          bench gets an opacity knob on it. Same overlay blend, same result at
          the "on" setting. */}
      <div aria-hidden className="ground-dither" />

      <aside className="design-lab fixed right-4 bottom-4 z-[70] font-mono text-[10px] tracking-[0.06em]">
        {open && (
          <div className="design-lab-panel mb-2 max-h-[min(78vh,40rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-[15px] border border-line bg-bg/88 p-3.5 shadow-[0_18px_60px_-24px_var(--shadow-dialog)] backdrop-blur-xl">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <span className="uppercase tracking-[0.22em] text-muted">design studies</span>
              <button
                type="button"
                onClick={() => setSettings(DEFAULTS)}
                className="text-faint transition-colors duration-200 hover:text-fg"
              >
                reset
              </button>
            </div>
            <LabRow label="ground" options={GROUNDS} value={settings.ground} onChange={(value) => update("ground", value)} />
            <LabRow label="amount" options={GROUND_AMOUNTS} value={settings.groundAmount} onChange={(value) => update("groundAmount", value)} />
            <LabRow label="dither" options={GROUND_DITHERS} value={settings.groundDither} onChange={(value) => update("groundDither", value)} />
            <LabRow label="attach" options={GROUND_ATTACHES} value={settings.groundAttach} onChange={(value) => update("groundAttach", value)} />
            <LabRow label="film" options={FILMS} value={settings.film} onChange={(value) => update("film", value)} />
            <LabRow label="type" options={TYPES} value={settings.typography} onChange={(value) => update("typography", value)} />
            <LabRow label="motion" options={MOTIONS} value={settings.textMotion} onChange={(value) => update("textMotion", value)} />
            <p className="px-1 pt-2 leading-relaxed text-faint">
              Press <span className="text-muted">g</span> anywhere to cycle the ground while you read.
              Hover the name for its Urdu counterpart. Settings persist while you browse.
            </p>
          </div>
        )}

        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="ml-auto flex items-center gap-2 rounded-full border border-line bg-bg/86 px-3 py-2 text-muted shadow-sm backdrop-blur-xl transition-[border-color,color] duration-300 hover:border-faint hover:text-fg"
        >
          <span className={`h-1.5 w-1.5 rounded-full bg-fg transition-opacity ${open ? "opacity-100" : "opacity-45"}`} />
          design lab
        </button>
      </aside>
    </>
  );
}

function LabRow<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: { value: T; label: string; title: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="border-t border-line py-2.5 first:border-t-0">
      <span className="mb-1.5 block px-1 uppercase tracking-[0.18em] text-faint">{label}</span>
      {/* column count follows the option count, so a two-way study (attach)
          reads as two halves rather than two buttons and two holes */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        role="group"
        aria-label={label}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              title={option.title}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`rounded-full px-1.5 py-1.5 transition-colors duration-200 ${
                active ? "bg-fg text-bg" : "text-faint hover:bg-surface hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
