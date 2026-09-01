"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { EASE } from "@/lib/motion";
import {
  FOOTER_KITTY_ART_ID,
  isKittyArtReady,
  kittyArtSrc,
  preloadKittyArt,
} from "@/lib/kitty-art";
import { useKitty } from "@/components/kitty/kitty-provider";

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
  const { enabled, open, revealed, settled, openKitty } = useKitty();
  const reduced = useReducedMotion();
  const button = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [pastEndActive, setPastEndActive] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [eyesOpen, setEyesOpen] = useState(false);
  const [glance, setGlance] = useState(0);
  const [artReady, setArtReady] = useState(() =>
    isKittyArtReady(FOOTER_KITTY_ART_ID),
  );

  useEffect(() => {
    let active = true;
    void preloadKittyArt(FOOTER_KITTY_ART_ID).then((ready) => {
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
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedule = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        setDialogueIndex((current) => {
          const offset = 1 + Math.floor(Math.random() * (DIALOGUES.length - 1));
          return (current + offset) % DIALOGUES.length;
        });
        schedule();
      }, randomBetween(7000, 11000));
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [idle]);

  useEffect(() => {
    if (!idle) return;
    let wakeTimer: ReturnType<typeof setTimeout>;
    let sleepTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedule = () => {
      wakeTimer = setTimeout(() => {
        if (cancelled) return;
        setGlance([-0.8, 0, 0.8][Math.floor(Math.random() * 3)]);
        setEyesOpen(true);
        sleepTimer = setTimeout(() => {
          if (cancelled) return;
          setEyesOpen(false);
          setGlance(0);
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

  if (!enabled) return null;

  const visible = revealed && artReady && !open;
  const label =
    reduced || interacting
      ? "ask about the work →"
      : settled
        ? DIALOGUES[dialogueIndex]
        : "hey. down here.";

  return (
    <>
      <span className="kitty-footer-reveal" data-kitty-reveal aria-hidden="true" />
      <motion.button
        ref={button}
        type="button"
        className="kitty-footer-launcher"
        data-visible={visible}
        disabled={!visible}
        aria-label="Ask kitty about Ammar's work"
        aria-expanded={open}
        onClick={(event) => openKitty(event.currentTarget)}
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocus={() => setInteracting(true)}
        onBlur={() => setInteracting(false)}
      >
        <motion.span
          aria-hidden="true"
          className="kitty-footer-mark"
          initial={false}
          animate={
            visible
              ? { y: 0, clipPath: "inset(0 0 0% 0)" }
              : { y: 14, clipPath: "inset(0 0 100% 0)" }
          }
          transition={{
            duration: reduced ? 0 : settled ? 0.32 : 0.58,
            ease: EASE,
          }}
        >
          <span className="kitty-footer-face">
            <Image
              src={kittyArtSrc(FOOTER_KITTY_ART_ID)}
              alt=""
              width={100}
              height={100}
              unoptimized
              preload
              className="kitty-art kitty-footer-art"
            />
            <motion.span
              className="kitty-footer-open-eyes"
              animate={{
                opacity: eyesOpen && idle ? 1 : 0,
                x: eyesOpen && idle ? glance : 0,
              }}
              transition={{ duration: reduced ? 0 : 0.12, ease: EASE }}
            >
              <i className="kitty-eye-patch kitty-eye-patch-left" />
              <i className="kitty-eye-patch kitty-eye-patch-right" />
              <i className="kitty-open-eye kitty-open-eye-left" />
              <i className="kitty-open-eye kitty-open-eye-right" />
            </motion.span>
          </span>
        </motion.span>

        <motion.span
          className="kitty-footer-dialogue"
          initial={false}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
          transition={{
            duration: reduced ? 0 : 0.32,
            delay: visible && !settled && !reduced ? 0.52 : 0,
            ease: EASE,
          }}
          aria-hidden="true"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={label}
              initial={reduced ? false : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -3 }}
              transition={{ duration: reduced ? 0 : 0.2, ease: EASE }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.button>
    </>
  );
}
