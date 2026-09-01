"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { EASE } from "@/lib/motion";
import {
  FOOTER_KITTY_AWAKE_SRC,
  FOOTER_KITTY_ART_ID,
  isFooterKittyArtReady,
  kittyArtSrc,
  preloadFooterKittyArt,
} from "@/lib/kitty-art";
import { useKitty } from "@/components/kitty/kitty-provider";

type DiscoveryClue =
  | "waiting"
  | "rustling"
  | "after-rustle"
  | "peeking"
  | "resting";

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
      { threshold: 0.15 },
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

    const mobile = window.matchMedia("(max-width: 520px)").matches;
    const delay = (() => {
      if (clue === "waiting") return randomBetween(2000, 4000);
      if (clue === "rustling") return 1150;
      if (clue === "after-rustle") {
        return mobile
          ? randomBetween(2200, 3400)
          : randomBetween(2600, 4000);
      }
      if (clue === "peeking") return 1500;
      return randomBetween(5500, 8500);
    })();

    const timer = window.setTimeout(() => {
      setClue((current) => {
        if (current === "waiting") return "rustling";
        if (current === "rustling") return "after-rustle";
        if (current === "after-rustle") return "peeking";
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
  const awake = eyesOpen && (idle || (revealed && !settled));
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
        openKitty(event.currentTarget);
      }}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => {
        setInteracting(false);
        if (!revealed) setClue("resting");
      }}
      onFocus={() => setInteracting(true)}
      onBlur={() => {
        setInteracting(false);
        if (!revealed) setClue("resting");
      }}
    >
      <motion.span
        className="kitty-footer-disturbance"
        aria-hidden="true"
        initial={false}
        animate={
          clueActive && clue === "rustling"
            ? { opacity: [0, 1, 1, 1, 1, 0] }
            : { opacity: 0 }
        }
        transition={{
          duration: reduced ? 0 : 1.15,
          times: [0, 0.12, 0.34, 0.56, 0.84, 1],
          ease: EASE,
        }}
      >
        <motion.i
          animate={
            clueActive && clue === "rustling"
              ? {
                  y: [0, -3, 0, -3, 0, 0],
                  scaleX: [0.72, 1, 0.82, 0.96, 0.78, 0.72],
                }
              : { y: 0, scaleX: 0.8 }
          }
          transition={{
            duration: reduced ? 0 : 1.15,
            times: [0, 0.16, 0.34, 0.6, 0.82, 1],
            ease: EASE,
          }}
        />
      </motion.span>

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
                      "inset(0 0 0% 0)",
                      "inset(0 0 0% 0)",
                    ],
                  }
              : peeking
                ? { clipPath: "inset(0 0 36% 0)" }
                : { clipPath: "inset(0 0 100% 0)" }
        }
        transition={
          !settled && revealed && !reduced
            ? {
                duration: 1.55,
                times: [0, 0.08, 0.28, 0.68, 0.84, 0.92, 1],
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
                      y: ["48%", "45%", "32%", "0%", "0%", "2%", "0%"],
                    }
                : peeking
                  ? { y: "45%" }
                  : { y: "57%" }
          }
          transition={
            !settled && revealed && !reduced
              ? {
                  duration: 1.55,
                  times: [0, 0.08, 0.28, 0.68, 0.84, 0.92, 1],
                  ease: EASE,
                }
              : { duration: reduced ? 0 : 0.42, ease: EASE }
          }
        >
          <span className="kitty-footer-face">
            <motion.span
              className="kitty-footer-frame"
              initial={false}
              animate={{ opacity: awake ? 0 : 1 }}
              transition={{ duration: reduced ? 0 : 0.12, ease: EASE }}
            >
              <Image
                src={kittyArtSrc(FOOTER_KITTY_ART_ID)}
                alt=""
                width={100}
                height={100}
                unoptimized
                preload
                className="kitty-art kitty-footer-art"
              />
            </motion.span>
            <motion.span
              className="kitty-footer-frame"
              initial={false}
              animate={{ opacity: awake ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.12, ease: EASE }}
            >
              <Image
                src={FOOTER_KITTY_AWAKE_SRC}
                alt=""
                width={100}
                height={100}
                unoptimized
                preload
                className="kitty-art kitty-footer-art"
              />
            </motion.span>
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
              ? { opacity: [1, 1, 1, 1, 1, 1, 0] }
              : { opacity: 1 }
        }
        transition={
          revealed && !settled && !reduced
            ? {
                duration: 1.55,
                times: [0, 0.08, 0.28, 0.68, 0.84, 0.92, 1],
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
