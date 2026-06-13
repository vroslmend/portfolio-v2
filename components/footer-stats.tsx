"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";

const API = process.env.NEXT_PUBLIC_COUNTER_API_URL;

const QUIPS = [
  "thanks for scrolling this far.",
  "the prius remains undefeated.",
  "no cookies — just counting.",
  "these numbers live in a tiny database in mumbai.",
  "you found the bottom of the page.",
];

type Counts = { visits: number; prius: number };

export function FooterStats() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [open, setOpen] = useState(false);
  const [quip] = useState(
    () => QUIPS[Math.floor(Math.random() * QUIPS.length)]
  );

  useEffect(() => {
    if (!API) return;
    let cancelled = false;

    (async () => {
      try {
        // count this visit once per browser session (no cookies, no PII)
        if (!sessionStorage.getItem("counted")) {
          sessionStorage.setItem("counted", "1");
          await fetch(`${API}/counts/visits/hit`, { method: "POST" });
        }
        const res = await fetch(`${API}/counts`);
        const data = (await res.json()) as Counts;
        if (!cancelled) setCounts(data);
      } catch {
        /* stats are non-critical — stay hidden if the API is unreachable */
      }
    })();

    // the Prius easter egg fires this when it drives by
    function onDrove() {
      fetch(`${API}/counts/prius/hit`, { method: "POST" })
        .then((r) => r.json())
        .then((d: { prius: number }) =>
          setCounts((c) => (c ? { ...c, prius: d.prius } : c))
        )
        .catch(() => {});
    }
    window.addEventListener("prius-drove", onDrove);
    return () => {
      cancelled = true;
      window.removeEventListener("prius-drove", onDrove);
    };
  }, []);

  if (!API || !counts) return null;

  return (
    <div className="font-mono text-[11px] tracking-[0.12em] text-faint">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="u-link cursor-pointer hover:text-muted"
      >
        stats {open ? "−" : "+"}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <dl className="flex flex-col gap-1 pt-4">
              <div className="flex items-baseline justify-between gap-6">
                <dt>visitors</dt>
                <dd className="text-muted">
                  {counts.visits.toLocaleString()}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt>prius driven</dt>
                <dd className="text-muted">
                  {counts.prius.toLocaleString()}×
                </dd>
              </div>
            </dl>
            <p className="max-w-[40ch] pt-3 text-faint">{quip}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
