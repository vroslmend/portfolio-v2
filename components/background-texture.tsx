"use client";

import { useEffect, useState } from "react";

type Film = "clean" | "fine" | "16mm" | "nocturne";
type Typography = "geist" | "editorial" | "roman" | "hybrid";
type TextMotion = "still" | "float" | "cursor" | "projector";

type LabState = {
  film: Film;
  typography: Typography;
  textMotion: TextMotion;
};

const STORAGE_KEY = "portfolio-design-lab-v2";
const DEFAULTS: LabState = {
  film: "fine",
  typography: "editorial",
  textMotion: "still",
};

const FILMS: { value: Film; label: string; title: string }[] = [
  { value: "clean", label: "clean", title: "Fine, restrained grain" },
  { value: "fine", label: "fine", title: "The current balanced film texture" },
  { value: "16mm", label: "16mm", title: "Coarser grain with sparse exposure flicker" },
  { value: "nocturne", label: "night", title: "Film grain with slow monochrome halation" },
];

const TYPES: { value: Typography; label: string; title: string }[] = [
  { value: "geist", label: "geist", title: "Modern sans display type" },
  { value: "editorial", label: "italic", title: "Newsreader italic throughout the display layer" },
  { value: "roman", label: "roman", title: "Newsreader upright for quieter editorial luxury" },
  { value: "hybrid", label: "hybrid", title: "Sans and serif contrast inside the name" },
];

const MOTIONS: { value: TextMotion; label: string; title: string }[] = [
  { value: "still", label: "still", title: "Only the existing entrance and scroll motion" },
  { value: "float", label: "float", title: "A very slow hero-only optical drift" },
  { value: "cursor", label: "depth", title: "Restrained cursor parallax and a local highlight" },
  { value: "projector", label: "projector", title: "Sparse film-gate jitter on the name" },
];

function isLabState(value: unknown): value is LabState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<LabState>;
  return (
    FILMS.some((option) => option.value === state.film) &&
    TYPES.some((option) => option.value === state.typography) &&
    MOTIONS.some((option) => option.value === state.textMotion)
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
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Persistence is optional; the comparison itself remains functional.
    }
  }, [hydrated, settings]);

  function update<K extends keyof LabState>(key: K, value: LabState[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <div aria-hidden className="film-atmosphere" />

      <aside className="design-lab fixed right-4 bottom-4 z-[70] font-mono text-[10px] tracking-[0.06em]">
        {open && (
          <div className="design-lab-panel mb-2 w-[min(20rem,calc(100vw-2rem))] rounded-[15px] border border-line bg-bg/88 p-3.5 shadow-[0_18px_60px_-24px_var(--shadow-dialog)] backdrop-blur-xl">
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
            <LabRow label="film" options={FILMS} value={settings.film} onChange={(value) => update("film", value)} />
            <LabRow label="type" options={TYPES} value={settings.typography} onChange={(value) => update("typography", value)} />
            <LabRow label="text" options={MOTIONS} value={settings.textMotion} onChange={(value) => update("textMotion", value)} />
            <p className="px-1 pt-2 leading-relaxed text-faint">
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
      <div className="grid grid-cols-4 gap-1" role="group" aria-label={label}>
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
