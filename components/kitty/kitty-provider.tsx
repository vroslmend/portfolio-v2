"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { EASE } from "@/lib/motion";
import {
  isKittyArtReady,
  kittyArtSrc,
  preloadAllKittyArt,
  preloadKittyArt,
  type KittyArtId,
} from "@/lib/kitty-art";
import { KittyTitleLink } from "@/components/kitty/kitty-title-link";

const API = process.env.NEXT_PUBLIC_KITTY_API_URL?.replace(/\/$/, "");
const STORE = "portfolio-kitty-session-v1";
const MIN_STEP_MS = 450;

const CHAT_SEQUENCE: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.08, staggerChildren: 0.07 } },
};

const CHAT_LIST: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { delayChildren: 0.05, staggerChildren: 0.045 },
  },
};

const CHAT_ITEM: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
};

type Phase = "idle" | "working" | "streaming" | "error" | "sleeping";
type MessageKind = "answer" | "question" | "error" | "napping";

type Message = {
  id: string;
  role: "user" | "kitty";
  text: string;
  kind?: MessageKind;
  options?: string[];
  selected?: string;
};

type StoredSession = {
  threadId: string | null;
  messages: Message[];
  discovered?: boolean;
};

type KittyContextValue = {
  enabled: boolean;
  open: boolean;
  revealed: boolean;
  settled: boolean;
  wide: boolean;
  discoverKitty: () => void;
  openKitty: (opener?: HTMLElement | null, focusInput?: boolean) => void;
  closeKitty: (restoreFocus?: boolean) => void;
};

const KittyContext = createContext<KittyContextValue | null>(null);

export function useKitty() {
  const value = useContext(KittyContext);
  if (!value) throw new Error("useKitty must be used inside KittyProvider");
  return value;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function useWideRail() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1400px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

export function KittyProvider({ children }: { children: React.ReactNode }) {
  const enabled = Boolean(API);
  const wide = useWideRail();
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [liveStatus, setLiveStatus] = useState("");
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [retry, setRetry] = useState<{ text: string; errorId: string } | null>(null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const running = useRef(false);
  const focusInputOnOpen = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rateTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!enabled) return;
    void preloadAllKittyArt();
  }, [enabled]);

  // Vercel and Neon both scale to zero and their cold starts stack, so the
  // visitor reads the page while the service wakes rather than after asking.
  useEffect(() => {
    if (!enabled) return;
    void fetch(`${API}/health`, { cache: "no-store" }).catch(() => {});
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const frame = requestAnimationFrame(() => {
      try {
        const saved = sessionStorage.getItem(STORE);
        if (saved) {
          const parsed = JSON.parse(saved) as StoredSession;
          if (Array.isArray(parsed.messages)) setMessages(parsed.messages.slice(-24));
          if (typeof parsed.threadId === "string") setThreadId(parsed.threadId);
          if (parsed.discovered) {
            setRevealed(true);
            setSettled(true);
          }
        }
      } catch {
        // A blocked session store should not block the assistant.
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  useEffect(() => {
    if (!hydrated || phase === "working" || phase === "streaming") return;
    try {
      sessionStorage.setItem(
        STORE,
        JSON.stringify({
          threadId,
          messages: messages.slice(-24),
          discovered: revealed,
        } satisfies StoredSession),
      );
    } catch {
      // Conversation still works for this page lifetime.
    }
  }, [hydrated, messages, phase, revealed, threadId]);

  useEffect(
    () => () => {
      clearTimeout(introTimer.current);
      clearTimeout(rateTimer.current);
    },
    [],
  );

  const revealKitty = useCallback(
    (introduce = true) => {
      if (!enabled || revealed) return;
      clearTimeout(introTimer.current);
      setRevealed(true);
      const shouldIntroduce = introduce && !reduced;
      setSettled(!shouldIntroduce);
      if (shouldIntroduce) {
        introTimer.current = setTimeout(() => setSettled(true), 2600);
      }
    },
    [enabled, reduced, revealed],
  );

  const discoverKitty = useCallback(() => revealKitty(true), [revealKitty]);

  const closeKitty = useCallback((restoreFocus = true) => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("kitty-open-change", { detail: { open: false } }));
    if (restoreFocus) {
      window.setTimeout(() => {
        if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
      }, reduced ? 0 : 430);
    }
  }, [reduced]);

  const openKitty = useCallback(
    (source?: HTMLElement | null, focusInput = false) => {
      if (!enabled) return;
      opener.current = source ?? (document.activeElement as HTMLElement | null);
      focusInputOnOpen.current = focusInput;
      revealKitty(false);
      setOpen(true);
      window.dispatchEvent(new CustomEvent("kitty-open-change", { detail: { open: true } }));
    },
    [enabled, revealKitty],
  );

  useEffect(() => {
    const onOpen = (event: Event) =>
      openKitty(
        undefined,
        Boolean(
          (event as CustomEvent<{ focusInput?: boolean }>).detail?.focusInput,
        ),
      );
    const onClose = (event: Event) =>
      closeKitty((event as CustomEvent<{ restoreFocus?: boolean }>).detail?.restoreFocus ?? true);
    window.addEventListener("open-kitty", onOpen);
    window.addEventListener("close-kitty", onClose);
    return () => {
      window.removeEventListener("open-kitty", onOpen);
      window.removeEventListener("close-kitty", onClose);
    };
  }, [closeKitty, openKitty]);

  useEffect(() => {
    if (!open || !stickToBottom.current) return;
    const frame = requestAnimationFrame(() => {
      const element = scroll.current;
      if (!element) return;
      const top = element.scrollHeight - element.clientHeight;
      // A streamed token adds a few pixels. Easing each one restarts the smooth
      // scroll about twenty-five times a second, which is the stutter. Only a
      // row mounting moves far enough to be worth easing.
      element.scrollTo({
        top,
        behavior: reduced || top - element.scrollTop < 40 ? "auto" : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [liveStatus, messages, open, reduced]);

  useEffect(() => {
    if (!open || wide) {
      lenis?.start();
      return;
    }
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis, open, wide]);

  // dvh tracks browser chrome, not the keyboard, so the sheet needs the real inset.
  useEffect(() => {
    const view = window.visualViewport;
    if (!open || wide || !view) return;
    const track = () => {
      const inset = Math.max(0, window.innerHeight - view.height - view.offsetTop);
      document.documentElement.style.setProperty("--kitty-keyboard", `${inset}px`);
    };
    track();
    view.addEventListener("resize", track);
    view.addEventListener("scroll", track);
    return () => {
      view.removeEventListener("resize", track);
      view.removeEventListener("scroll", track);
      document.documentElement.style.removeProperty("--kitty-keyboard");
    };
  }, [open, wide]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      const target = focusInputOnOpen.current ? input.current : panel.current;
      target?.focus({ preventScroll: true });
      focusInputOnOpen.current = false;
    }, reduced ? 0 : 700);
    return () => {
      window.clearTimeout(timer);
      focusInputOnOpen.current = false;
    };
  }, [open, reduced]);

  useEffect(() => {
    if (!open || !wide) return;

    const closeFromOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (panel.current?.contains(target) || target.closest(".kitty-rail-head")) return;
      closeKitty(false);
    };

    document.addEventListener("pointerdown", closeFromOutside);
    return () => document.removeEventListener("pointerdown", closeFromOutside);
  }, [closeKitty, open, wide]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeKitty();
        return;
      }
      if (wide || event.key !== "Tab" || !panel.current) return;
      const focusable = Array.from(
        panel.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === panel.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeKitty, open, wide]);

  const appendError = useCallback((text: string, retryText?: string) => {
    const errorId = uid();
    setMessages((current) => [
      ...current,
      { id: errorId, role: "kitty", text, kind: "error" },
    ]);
    setPhase("error");
    setAnnouncement(text);
    setRetry(retryText ? { text: retryText, errorId } : null);
  }, []);

  const send = useCallback(
    async (raw: string, appendUser = true) => {
      const text = raw.trim();
      if (!API || !text || running.current || phase === "working" || phase === "streaming") return;
      if (rateLimitedUntil && rateLimitedUntil > Date.now()) return;
      running.current = true;
      stickToBottom.current = true;

      if (appendUser) {
        setMessages((current) => [...current, { id: uid(), role: "user", text }]);
      }
      setDraft("");
      setRetry(null);
      setPhase("working");
      setLiveStatus("working");
      setAnnouncement("");

      let shownAt = performance.now();
      let shownLabel = "working";
      let answerId: string | null = null;
      let answerText = "";
      let questionText = "";
      let eventError = false;
      let painting = false;

      // Label pacing must never block the stream. It used to be awaited inside
      // the read loop, so a tool that answered faster than MIN_STEP_MS held
      // every token behind the current label's minimum, then released the
      // backlog at once. Queue the change instead and let tokens through.
      let labelTimer: ReturnType<typeof setTimeout> | undefined;

      function queueLabel(label: string) {
        if (label === shownLabel) return;
        const left = shownLabel
          ? Math.max(0, MIN_STEP_MS - (performance.now() - shownAt))
          : 0;
        clearTimeout(labelTimer);
        labelTimer = setTimeout(() => {
          shownLabel = label;
          shownAt = performance.now();
          setLiveStatus(label);
        }, left);
      }

      try {
        const response = await fetch(`${API}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, thread_id: threadId }),
        });

        if (response.status === 429) {
          const payload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          const seconds = Math.max(1, Number(response.headers.get("Retry-After")) || 60);
          setRateLimitedUntil(Date.now() + seconds * 1000);
          clearTimeout(rateTimer.current);
          rateTimer.current = setTimeout(() => setRateLimitedUntil(null), seconds * 1000);
          queueLabel("");
          setDraft(text);
          appendError(payload?.message ?? "too many requests. slow down.", text);
          return;
        }

        if (!response.ok || !response.body) throw new Error(`chat returned ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        async function handle(record: string) {
          const json = record
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");
          if (!json) return;
          const event = JSON.parse(json) as {
            type: "step" | "token" | "question" | "done" | "error";
            label?: string;
            text?: string;
            options?: string[];
            thread_id?: string;
            message?: string;
          };

          if (event.type === "step" && event.label) {
            queueLabel(event.label);
          } else if (event.type === "token" && event.text) {
            if (!answerId) {
              // Not awaited. The stream keeps arriving through the label's
              // minimum display time, so blocking here stalls the answer and
              // then floods the backlog in one burst.
              queueLabel("");
              answerId = uid();
              setMessages((current) => [
                ...current,
                { id: answerId!, role: "kitty", text: "", kind: "answer" },
              ]);
              setPhase("streaming");
            }
            answerText += event.text;
            // One render a frame. A token is a few characters and a render
            // each costs a layout pass and a scroll correction.
            if (!painting) {
              painting = true;
              requestAnimationFrame(() => {
                painting = false;
                const id = answerId;
                setMessages((current) =>
                  current.map((message) =>
                    message.id === id ? { ...message, text: answerText } : message,
                  ),
                );
              });
            }
          } else if (event.type === "question" && event.text) {
            queueLabel("");
            questionText = event.text;
            setMessages((current) => [
              ...current,
              {
                id: uid(),
                role: "kitty",
                text: event.text!,
                kind: "question",
                options: event.options ?? [],
              },
            ]);
          } else if (event.type === "error") {
            queueLabel("");
            eventError = true;
            appendError(event.message ?? "something went wrong on my end.", text);
          } else if (event.type === "done" && event.thread_id) {
            setThreadId(event.thread_id);
          }
        }

        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });
          const records = buffer.split(/\r?\n\r?\n/);
          buffer = records.pop() ?? "";
          for (const record of records) await handle(record);
          if (done) break;
        }
        if (buffer.trim()) await handle(buffer);

        // The last frame's worth of tokens may still be queued behind a rAF.
        if (answerId) {
          const id = answerId;
          setMessages((current) =>
            current.map((message) =>
              message.id === id ? { ...message, text: answerText } : message,
            ),
          );
        }

        queueLabel("");
        if (eventError) return;
        const finalText = answerText || questionText;
        if (answerId && finalText === "kitty's napping right now. try again in a bit.") {
          setMessages((current) =>
            current.map((message) =>
              message.id === answerId ? { ...message, kind: "napping" } : message,
            ),
          );
          setPhase("sleeping");
        } else if (
          answerId &&
          (finalText === "something went wrong on my end." ||
            finalText.startsWith("too many people are talking"))
        ) {
          setMessages((current) =>
            current.map((message) =>
              message.id === answerId ? { ...message, kind: "error" } : message,
            ),
          );
          setPhase("error");
        } else {
          setPhase("idle");
        }
        setAnnouncement(finalText);
      } catch {
        queueLabel("");
        appendError("couldn't reach kitty. try again.", text);
      } finally {
        running.current = false;
      }
    },
    [appendError, phase, rateLimitedUntil, threadId],
  );

  const selectOption = useCallback(
    (messageId: string, option: string) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, selected: option } : message,
        ),
      );
      void send(option);
    },
    [send],
  );

  const retryLast = useCallback(() => {
    if (!retry) return;
    setMessages((current) => current.filter((message) => message.id !== retry.errorId));
    const text = retry.text;
    setRetry(null);
    void send(text, false);
  }, [retry, send]);

  const value = useMemo<KittyContextValue>(
    () => ({
      enabled,
      open,
      revealed,
      settled,
      wide,
      discoverKitty,
      openKitty,
      closeKitty,
    }),
    [closeKitty, discoverKitty, enabled, open, openKitty, revealed, settled, wide],
  );

  const busy = phase === "working" || phase === "streaming";
  const rateLimited = rateLimitedUntil !== null;
  // The sheet covers the page it just sent them to; focus belongs to the route.
  const closeOnNavigate = useCallback(() => {
    if (!wide) closeKitty(false);
  }, [closeKitty, wide]);
  const latestKitty = [...messages].reverse().find((message) => message.role === "kitty");
  const latestUser = [...messages].reverse().find((message) => message.role === "user");
  const latestPose: KittyArtId =
    latestKitty?.kind === "error"
      ? "8273706"
      : latestKitty?.kind === "napping"
        ? "7574338"
        : "8273689";

  return (
    <KittyContext.Provider value={value}>
      {children}
      {enabled && (
        <>
          <AnimatePresence>
            {open && (
              <div className="kitty-overlay" data-wide={wide}>
                {!wide && (
                  <motion.button
                    type="button"
                    aria-label="close kitty"
                    className="kitty-scrim"
                    onClick={() => closeKitty()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.35 }}
                  />
                )}
                <motion.section
                  ref={panel}
                  role="dialog"
                  aria-modal={!wide}
                  aria-label="Ask kitty about Ammar's work"
                  className="kitty-panel"
                  tabIndex={-1}
                  initial={
                    reduced
                      ? { opacity: 1 }
                      : wide
                        ? { opacity: 0, x: 28 }
                        : { y: "100%" }
                  }
                  animate={wide ? { opacity: 1, x: 0 } : { y: 0 }}
                  exit={
                    reduced
                      ? { opacity: 0 }
                      : wide
                        ? { opacity: 0, x: 22 }
                        : { y: "100%" }
                  }
                  transition={{ duration: reduced ? 0 : wide ? 0.68 : 0.62, ease: EASE }}
                >
                  <header className="kitty-head">
                    <KittyTitleLink />
                    <button
                      type="button"
                      className="kitty-close"
                      aria-label="close kitty"
                      onClick={() => closeKitty()}
                    >
                      ×
                    </button>
                  </header>

                  <motion.div
                    ref={scroll}
                    className="kitty-scroll"
                    // The vignette layout-animates inside here. Without this,
                    // Motion reads every scroll as the cat having moved and
                    // fires a correction on each streamed token.
                    layoutScroll
                    // Lenis preventDefaults wheel and touch even while stopped,
                    // so without this the transcript never scrolls.
                    data-lenis-prevent
                    onScroll={(event) => {
                      const element = event.currentTarget;
                      stickToBottom.current =
                        element.scrollHeight - element.scrollTop - element.clientHeight < 96;
                    }}
                  >
                    <div className="kitty-inner">
                      {/* popLayout, not wait: the empty state must not hold the
                          panel blank while the first turn waits its turn to enter */}
                      <AnimatePresence initial={false} mode="popLayout">
                        {messages.length === 0 ? (
                          <KittyEmpty
                            key="empty"
                            onAsk={(question) => void send(question)}
                          />
                        ) : (
                          <motion.div
                            key="transcript"
                            className="kitty-transcript"
                            initial={reduced ? false : { opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduced ? undefined : { opacity: 0, y: -4 }}
                            transition={{ duration: reduced ? 0 : 0.26, ease: EASE }}
                          >
                            <AnimatePresence initial={false}>
                              {messages.map((message) => {
                                const isLatestKitty = message.id === latestKitty?.id;
                                const showScene = message.id === latestUser?.id;
                                const scenePose: KittyArtId = busy
                                  ? phase === "working"
                                    ? "8273687"
                                    : "8273689"
                                  : latestPose;

                                return (
                                  <motion.div
                                    key={message.id}
                                    className="kitty-message"
                                    initial={reduced ? false : { opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={reduced ? undefined : { opacity: 0, y: -4 }}
                                    transition={{
                                      duration: reduced ? 0 : 0.28,
                                      ease: EASE,
                                    }}
                                  >
                                    <article className={`kitty-turn kitty-${message.role}`}>
                                      <span className="kitty-turn-label">{message.role}</span>
                                      <KittyMessageText
                                        text={message.text}
                                        onNavigate={closeOnNavigate}
                                      />
                                      {message.kind === "question" &&
                                      message.options?.length ? (
                                        <KittyOptions
                                          options={message.options}
                                          disabled={busy || Boolean(message.selected)}
                                          selected={message.selected}
                                          onSelect={(option) =>
                                            selectOption(message.id, option)
                                          }
                                        />
                                      ) : null}
                                      {message.kind === "error" &&
                                      isLatestKitty &&
                                      retry?.errorId === message.id ? (
                                        <motion.button
                                          type="button"
                                          className="kitty-retry"
                                          disabled={rateLimited}
                                          onClick={retryLast}
                                          initial={
                                            reduced ? false : { opacity: 0, y: 4 }
                                          }
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{
                                            duration: reduced ? 0 : 0.24,
                                            delay: reduced ? 0 : 0.08,
                                            ease: EASE,
                                          }}
                                        >
                                          retry <i aria-hidden="true">↗</i>
                                        </motion.button>
                                      ) : null}
                                    </article>
                                    {showScene ? (
                                      <KittyScene
                                        id={scenePose}
                                        status={busy ? liveStatus : ""}
                                        compact
                                      />
                                    ) : null}
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <form
                    className="kitty-compose"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void send(draft);
                    }}
                  >
                    <label htmlFor="kitty-question">ask</label>
                    <input
                      ref={input}
                      id="kitty-question"
                      value={draft}
                      maxLength={2000}
                      autoComplete="off"
                      enterKeyHint="send"
                      placeholder="about the work…"
                      onChange={(event) => setDraft(event.target.value)}
                    />
                    <button
                      type="submit"
                      aria-label="send question"
                      disabled={
                        !draft.trim() ||
                        busy ||
                        rateLimited
                      }
                    >
                      ↗
                    </button>
                  </form>
                </motion.section>
              </div>
            )}
          </AnimatePresence>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {liveStatus || announcement}
          </p>
        </>
      )}
    </KittyContext.Provider>
  );
}

function KittyArt({ id, className = "" }: { id: KittyArtId; className?: string }) {
  return (
    <Image
      src={kittyArtSrc(id)}
      alt=""
      width={100}
      height={100}
      unoptimized
      className={`kitty-art ${className}`}
    />
  );
}

function useDecodedKittyArt(id: KittyArtId) {
  const [displayedId, setDisplayedId] = useState<KittyArtId | null>(() =>
    isKittyArtReady(id) ? id : null,
  );

  useEffect(() => {
    let active = true;
    void preloadKittyArt(id).then((ready) => {
      if (active && ready) setDisplayedId(id);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return displayedId;
}

function KittyScene({
  id,
  status,
  compact = false,
}: {
  id: KittyArtId;
  status: string;
  compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const displayedId = useDecodedKittyArt(id);

  return (
    <motion.div
      // One vignette that travels to the newest turn, not one per turn. Mounting
      // a second and unmounting the first put two cats on screen at once and
      // then teleported the survivor when the old one's height collapsed.
      layoutId="kitty-vignette"
      className={`kitty-scene${compact ? " is-compact" : ""}`}
      // Not a fade from zero: relocating remounts this, and an enter animation
      // then dips the cat to transparent halfway through its own travel.
      initial={false}
      animate={{ opacity: displayedId ? 1 : 0 }}
      transition={{
        duration: reduced ? 0 : 0.32,
        ease: EASE,
        layout: { duration: reduced ? 0 : 0.62, ease: EASE },
      }}
      aria-hidden="true"
    >
      <AnimatePresence initial={false} mode="sync">
        {displayedId ? (
          <motion.span
            key={displayedId}
            className="kitty-scene-pose"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: EASE }}
          >
            <KittyArt id={displayedId} />
          </motion.span>
        ) : null}
      </AnimatePresence>
      <span className="kitty-status">
        <AnimatePresence initial={false} mode="wait">
          {status ? (
            <motion.span
              key={status}
              initial={reduced ? false : { opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -2 }}
              transition={{ duration: reduced ? 0 : 0.18, ease: EASE }}
            >
              {status}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </motion.div>
  );
}

// (?!\/) keeps protocol-relative //host out of the site-path branch.
const LINK_PATTERN =
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]*)\)|(https?:\/\/[^\s]+)/g;

function KittyMessageText({
  text,
  onNavigate,
}: {
  text: string;
  onNavigate: () => void;
}) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(text.slice(cursor, index));

    const rawUrl = match[2] ?? match[3];
    if (!rawUrl) continue;
    const trailing = match[3]?.match(/[.,!?;:]+$/)?.[0] ?? "";
    const url = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;
    const label = match[1] ?? url;
    // A path with an extension is a file in public/, not a route. The rest of
    // the site opens those in a tab, so /resume.pdf belongs on the anchor.
    const isRoute = url.startsWith("/") && !/\.[a-z0-9]+$/i.test(url);
    parts.push(
      isRoute ? (
        <Link key={`${index}-${url}`} href={url} onClick={onNavigate}>
          {label}
        </Link>
      ) : (
        <a key={`${index}-${url}`} href={url} target="_blank" rel="noreferrer">
          {label}
        </a>
      ),
    );
    if (trailing) parts.push(trailing);
    cursor = index + match[0].length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return <p>{parts}</p>;
}

const SUGGESTIONS = [
  "which project goes deepest technically?",
  "what have you built with ai?",
  "show me the backend-heavy work",
];

const KittyEmpty = forwardRef<
  HTMLDivElement,
  { onAsk: (question: string) => void }
>(function KittyEmpty({ onAsk }, ref) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className="kitty-empty"
      variants={CHAT_SEQUENCE}
      initial={reduced ? false : "hidden"}
      animate="show"
      exit={reduced ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: reduced ? 0 : 0.18, ease: EASE }}
    >
      <KittyScene id="8273689" status="" />
      <motion.p className="kitty-intro" variants={CHAT_ITEM}>
        Ask about a project, the stack, or why I built it.
      </motion.p>
      <motion.div
        className="kitty-prompts"
        aria-label="suggested questions"
        variants={CHAT_LIST}
      >
        {SUGGESTIONS.map((question) => (
          <motion.button
            key={question}
            type="button"
            onClick={() => onAsk(question)}
            variants={CHAT_ITEM}
          >
            <span>{question}</span>
            <i aria-hidden="true">↗</i>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
});

function KittyOptions({
  options,
  disabled,
  selected,
  onSelect,
}: {
  options: string[];
  disabled: boolean;
  selected?: string;
  onSelect: (option: string) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="kitty-options"
      variants={CHAT_LIST}
      initial={reduced ? false : "hidden"}
      animate="show"
    >
      {options.map((option) => (
        <motion.button
          key={option}
          type="button"
          disabled={disabled}
          data-selected={selected === option}
          onClick={() => onSelect(option)}
          variants={CHAT_ITEM}
        >
          <span>{option}</span>
          <i aria-hidden="true">↗</i>
        </motion.button>
      ))}
    </motion.div>
  );
}
