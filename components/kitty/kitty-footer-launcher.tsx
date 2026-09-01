"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { EASE } from "@/lib/motion";
import {
  FOOTER_KITTY_BODY_SRC,
  isFooterKittyArtReady,
  preloadFooterKittyArt,
} from "@/lib/kitty-art";
import { useKitty } from "@/components/kitty/kitty-provider";

type DiscoveryClue =
  | "waiting"
  | "rustling"
  | "quiet"
  | "peeking"
  | "resting";

const EXIT_EASE = [0.7, 0, 0.84, 0] as const;
const KNOCK_EASE = [0.65, 0, 0.35, 1] as const;

const DIALOGUES = [
  "ask me about the work.",
  "pick a project.",
  "i know the technical bits.",
  "i've read the whole site.",
  "cmd k finds me too.",
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function KittyFooterLauncher() {
  const { enabled, open, revealed, settled, discoverKitty, openKitty } = useKitty();
  const reduced = useReducedMotion();
  const button = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [pastEndActive, setPastEndActive] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [clue, setClue] = useState<DiscoveryClue>("waiting");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [dialogueStarted, setDialogueStarted] = useState(false);
  const [dialogueVisible, setDialogueVisible] = useState(true);
  const [eyesOpen, setEyesOpen] = useState(false);
  const [artReady, setArtReady] = useState(isFooterKittyArtReady);

  useEffect(() => {
    let active = true;
    void preloadFooterKittyArt().then((ready) => {
      if (active) setArtReady(ready);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const element = button.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.65 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const update = (event: Event) => {
      setPastEndActive(
        Boolean((event as CustomEvent<{ active?: boolean }>).detail?.active),
      );
    };
    window.addEventListener("past-end-priority", update);
    return () => window.removeEventListener("past-end-priority", update);
  }, []);

  const clueActive =
    !revealed &&
    artReady &&
    inView &&
    pageVisible &&
    !open &&
    !pastEndActive;

  useEffect(() => {
    if (!clueActive || interacting || reduced) return;

    const delay = (() => {
      if (clue === "waiting") return randomBetween(1200, 1800);
      if (clue === "rustling") return 800;
      if (clue === "quiet") return randomBetween(900, 1150);
      if (clue === "peeking") return 2300;
      return randomBetween(7000, 10000);
    })();

    const timer = window.setTimeout(() => {
      setClue((current) => {
        if (current === "waiting") return "rustling";
        if (current === "rustling") return "quiet";
        if (current === "quiet") return "peeking";
        if (current === "peeking") return "resting";
        return "waiting";
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [clue, clueActive, interacting, reduced]);

  const idle =
    revealed &&
    settled &&
    inView &&
    pageVisible &&
    !open &&
    !interacting &&
    !pastEndActive &&
    !reduced;

  useEffect(() => {
    if (!idle) return;

    const delay = !dialogueStarted
      ? randomBetween(1500, 2200)
      : dialogueVisible
        ? randomBetween(5000, 7000)
        : randomBetween(9000, 14000);

    const timer = window.setTimeout(() => {
      if (!dialogueStarted) {
        setDialogueStarted(true);
        setDialogueVisible(true);
        return;
      }
      if (dialogueVisible) {
        setDialogueVisible(false);
        return;
      }
      setDialogueIndex((current) => {
        const offset = 1 + Math.floor(Math.random() * (DIALOGUES.length - 1));
        return (current + offset) % DIALOGUES.length;
      });
      setDialogueVisible(true);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [dialogueStarted, dialogueVisible, idle]);

  useEffect(() => {
    if (!idle) return;
    let wakeTimer: ReturnType<typeof setTimeout>;
    let sleepTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedule = () => {
      wakeTimer = setTimeout(() => {
        if (cancelled) return;
        setEyesOpen(true);
        sleepTimer = setTimeout(() => {
          if (cancelled) return;
          setEyesOpen(false);
          schedule();
        }, randomBetween(650, 1050));
      }, randomBetween(5000, 9000));
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(wakeTimer);
      clearTimeout(sleepTimer);
    };
  }, [idle]);

  useEffect(() => {
    if (!revealed || settled || reduced || open || !artReady) return;

    const openTimer = window.setTimeout(() => setEyesOpen(true), 1580);
    const closeTimer = window.setTimeout(() => setEyesOpen(false), 1880);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
    };
  }, [artReady, open, reduced, revealed, settled]);

  if (!enabled) return null;

  const visible = revealed && artReady && !open;
  const peeking =
    !revealed && artReady && (clue === "peeking" || interacting);
  const knocking = clueActive && !interacting && clue === "rustling";
  const knockTransition = {
    duration: reduced ? 0 : 0.26,
    times: [0, 0.28, 1],
    repeat: reduced ? 0 : 1,
    repeatDelay: reduced ? 0 : 0.26,
    ease: KNOCK_EASE,
  };
  const awake =
    revealed && (interacting || (eyesOpen && (idle || !settled)));
  const label: string | null =
    !revealed
      ? null
      : !settled
        ? "oh. hello."
        : reduced || interacting
          ? "ask about the work →"
          : dialogueStarted && dialogueVisible
            ? DIALOGUES[dialogueIndex]
            : null;

  return (
    <motion.button
      ref={button}
      type="button"
      className="kitty-footer-launcher"
      data-discovered={revealed}
      data-clue={clue}
      aria-label={revealed ? "Ask kitty about Ammar's work" : "Reveal kitty"}
      aria-expanded={revealed ? open : undefined}
      onClick={(event) => {
        if (!revealed) {
          discoverKitty();
          return;
        }
        setInteracting(false);
        openKitty(event.currentTarget);
      }}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={(event) => {
        setInteracting(event.currentTarget.matches(":focus-visible"));
        if (!revealed) setClue("waiting");
      }}
      onFocus={(event) =>
        setInteracting(event.currentTarget.matches(":focus-visible"))
      }
      onBlur={() => {
        setInteracting(false);
        if (!revealed) setClue("waiting");
      }}
    >
      <motion.span
        className="kitty-footer-disturbance"
        aria-hidden="true"
        initial={false}
        animate={knocking ? { opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={knockTransition}
      >
        <motion.i
          animate={
            knocking
              ? {
                  y: [0, -4, 0],
                  scaleX: [1, 0.88, 1],
                }
              : { y: 0, scaleX: 1 }
          }
          transition={knockTransition}
        />
      </motion.span>

      <motion.svg
        className="kitty-footer-impact"
        viewBox="0 0 56 22"
        fill="none"
        aria-hidden="true"
        initial={false}
        animate={
          knocking
            ? {
                opacity: [0, 0.88, 0],
                scale: [0.9, 1, 1.05],
                y: [1, -1, -2],
              }
            : { opacity: 0, scale: 0.9, y: 1 }
        }
        transition={knockTransition}
      >
        <path d="m17.5 15.5-7-4.1 1.8-2.2 6.3 5.1Z" />
        <path d="m27.2 10.8-1.7-8.6h3.1l.2 8.5Z" />
        <path d="m37.8 14.5 6-6.2 2 2.1-7 5.4Z" />
      </motion.svg>

      <motion.span
        aria-hidden="true"
        className="kitty-footer-mask"
        initial={false}
        animate={
          !artReady || open
            ? { clipPath: "inset(0 0 100% 0)" }
            : revealed
              ? settled || reduced
                ? { clipPath: "inset(0 0 0% 0)" }
                : {
                    clipPath: [
                      "inset(0 0 100% 0)",
                      "inset(0 0 36% 0)",
                      "inset(0 0 36% 0)",
                      "inset(0 0 36% 0)",
                      "inset(0 0 36% 0)",
                      "inset(0 0 36% 0)",
                      "inset(0 0 36% 0)",
                      "inset(0 0 0% 0)",
                    ],
                  }
              : { clipPath: "inset(0 0 36% 0)" }
        }
        transition={
          !settled && revealed && !reduced
            ? {
                duration: 1.55,
                times: [0, 0.08, 0.28, 0.68, 0.84, 0.92, 0.98, 1],
                ease: EASE,
              }
            : { duration: reduced ? 0 : 0.32, ease: EASE }
        }
      >
        <motion.span
          className="kitty-footer-mark"
          initial={false}
          animate={
            !artReady || open
              ? { y: "57%" }
              : revealed
                ? settled || reduced
                  ? { y: "0%" }
                  : {
                      y: [
                        "48%",
                        "45%",
                        "32%",
                        "0%",
                        "0%",
                        "2%",
                        "0%",
                        "0%",
                      ],
                    }
                : peeking
                  ? { y: "41%" }
                  : { y: "57%" }
          }
          transition={
            !settled && revealed && !reduced
              ? {
                  duration: 1.55,
                  times: [0, 0.08, 0.28, 0.68, 0.84, 0.92, 0.98, 1],
                  ease: EASE,
                }
              : {
                  duration: reduced ? 0 : peeking ? 0.42 : 0.4,
                  ease: !revealed && !peeking ? EXIT_EASE : EASE,
                }
          }
        >
          <span className="kitty-footer-face">
            <Image
              src={FOOTER_KITTY_BODY_SRC}
              alt=""
              width={100}
              height={100}
              unoptimized
              preload
              className="kitty-art kitty-footer-art"
            />
            <svg
              viewBox="0 0 100 100"
              className="kitty-art kitty-footer-art kitty-footer-eyes"
              aria-hidden="true"
            >
              <motion.g
                initial={false}
                animate={{ opacity: awake ? 0 : 1 }}
                transition={{ duration: reduced ? 0 : 0.09, ease: EASE }}
              >
                <path d="m53.559 24.031c-1.9805-0.39062-4.1484-0.058594-4.2383-0.050781-0.55078 0.078125-0.92187 0.58984-0.83984 1.1406 0.078125 0.55078 0.60156 0.92188 1.1406 0.83984 0.019531 0 1.9297-0.28906 3.5586 0.03125 0.058593 0.011718 0.12891 0.019531 0.19141 0.019531 0.46875 0 0.89062-0.32812 0.98047-0.80859 0.10938-0.53906-0.25-1.0703-0.78906-1.1719z" />
                <path d="m64.711 24.102c-2.0898-0.46875-4.1602-0.10937-4.2383-0.089843-0.53906 0.10156-0.89844 0.62109-0.80859 1.1602 0.089844 0.53906 0.62109 0.91016 1.1602 0.80859 0.019531 0 1.7695-0.30078 3.4609 0.078125 0.070313 0.019531 0.14844 0.019531 0.21875 0.019531 0.46094 0 0.87109-0.32031 0.96875-0.78125 0.12109-0.53906-0.21875-1.0703-0.76172-1.1914z" />
              </motion.g>
              <motion.g
                initial={false}
                animate={{ opacity: awake ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.09, ease: EASE }}
              >
                <circle cx="51.75" cy="25" r="1.3" />
                <circle cx="62.85" cy="25.05" r="1.3" />
              </motion.g>
            </svg>
          </span>
        </motion.span>
      </motion.span>

      <motion.span
        className="kitty-footer-edge"
        aria-hidden="true"
        initial={false}
        animate={
          !artReady || open || settled
            ? { opacity: 0 }
            : revealed
              ? { opacity: [1, 1, 1, 1, 1, 1, 1, 0] }
              : { opacity: 1 }
        }
        transition={
          revealed && !settled && !reduced
            ? {
                duration: 1.55,
                times: [0, 0.08, 0.28, 0.68, 0.84, 0.92, 0.98, 1],
                ease: EASE,
              }
            : { duration: reduced ? 0 : 0.18, ease: EASE }
        }
      />

      <motion.span
        className="kitty-footer-dialogue"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
        transition={{
          duration: reduced ? 0 : 0.32,
          delay: visible && !settled && !reduced ? 1.55 : 0,
          ease: EASE,
        }}
        aria-hidden="true"
      >
        <AnimatePresence mode="wait" initial={false}>
          {label ? (
            <motion.span
              key={label}
              initial={reduced ? false : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: 3 }}
              transition={{ duration: reduced ? 0 : 0.22, ease: EASE }}
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
