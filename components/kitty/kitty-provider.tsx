"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { EASE } from "@/lib/motion";
import {
  FOOTER_KITTY_ART_ID,
  isKittyArtReady,
  kittyArtSrc,
  preloadAllKittyArt,
  preloadKittyArt,
  type KittyArtId,
} from "@/lib/kitty-art";

const API = process.env.NEXT_PUBLIC_KITTY_API_URL?.replace(/\/$/, "");
const STORE = "portfolio-kitty-session-v1";
const MIN_STEP_MS = 450;

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
};

type KittyContextValue = {
  enabled: boolean;
  open: boolean;
  revealed: boolean;
  settled: boolean;
  wide: boolean;
  openKitty: (opener?: HTMLElement | null) => void;
  closeKitty: () => void;
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

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
  const pathname = usePathname();
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
  const closeButton = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rateTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!enabled) return;
    void preloadAllKittyArt();
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
        JSON.stringify({ threadId, messages: messages.slice(-24) } satisfies StoredSession),
      );
    } catch {
      // Conversation still works for this page lifetime.
    }
  }, [hydrated, messages, phase, threadId]);

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
      setRevealed(true);
      const shouldIntroduce = introduce && !reduced;
      setSettled(!shouldIntroduce);
      if (shouldIntroduce) {
        introTimer.current = setTimeout(() => setSettled(true), 2600);
      }
    },
    [enabled, reduced, revealed],
  );

  useEffect(() => {
    if (!enabled || revealed) return;
    const target = document.querySelector<HTMLElement>("[data-kitty-reveal]");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        void preloadKittyArt(FOOTER_KITTY_ART_ID).then(() => revealKitty(true));
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, pathname, revealKitty, revealed]);

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
    (source?: HTMLElement | null) => {
      if (!enabled) return;
      opener.current = source ?? (document.activeElement as HTMLElement | null);
      revealKitty(false);
      setOpen(true);
      window.dispatchEvent(new CustomEvent("kitty-open-change", { detail: { open: true } }));
    },
    [enabled, revealKitty],
  );

  useEffect(() => {
    const onOpen = () => openKitty();
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
      if (element) element.scrollTop = element.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [liveStatus, messages, open]);

  useEffect(() => {
    if (!open || wide) {
      lenis?.start();
      return;
    }
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis, open, wide]);

  useEffect(() => {
    if (!open) return;
    const target = wide ? input.current : closeButton.current;
    window.setTimeout(() => target?.focus({ preventScroll: true }), reduced ? 0 : 700);
  }, [open, reduced, wide]);

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
      if (event.shiftKey && document.activeElement === first) {
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

      async function holdLabel() {
        if (!shownLabel) return;
        const left = MIN_STEP_MS - (performance.now() - shownAt);
        if (left > 0) await wait(left);
      }

      async function showLabel(label: string) {
        if (label === shownLabel) return;
        await holdLabel();
        shownLabel = label;
        shownAt = performance.now();
        setLiveStatus(label);
      }

      async function clearLabel() {
        await holdLabel();
        shownLabel = "";
        setLiveStatus("");
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
          await clearLabel();
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
            await showLabel(event.label);
          } else if (event.type === "token" && event.text) {
            if (!answerId) {
              await clearLabel();
              answerId = uid();
              setMessages((current) => [
                ...current,
                { id: answerId!, role: "kitty", text: "", kind: "answer" },
              ]);
              setPhase("streaming");
            }
            answerText += event.text;
            const id = answerId;
            setMessages((current) =>
              current.map((message) =>
                message.id === id ? { ...message, text: answerText } : message,
              ),
            );
          } else if (event.type === "question" && event.text) {
            await clearLabel();
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
            await clearLabel();
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

        await clearLabel();
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
        await clearLabel();
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
      openKitty,
      closeKitty,
    }),
    [closeKitty, enabled, open, openKitty, revealed, settled, wide],
  );

  const busy = phase === "working" || phase === "streaming";
  const rateLimited = rateLimitedUntil !== null;
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
                    <span>kitty</span>
                    <button
                      ref={closeButton}
                      type="button"
                      className="kitty-close"
                      aria-label="close kitty"
                      onClick={() => closeKitty()}
                    >
                      ×
                    </button>
                  </header>

                  <div
                    ref={scroll}
                    className="kitty-scroll"
                    onScroll={(event) => {
                      const element = event.currentTarget;
                      stickToBottom.current =
                        element.scrollHeight - element.scrollTop - element.clientHeight < 96;
                    }}
                  >
                    <div className="kitty-inner">
                      {messages.length === 0 ? (
                        <KittyEmpty onAsk={(question) => void send(question)} />
                      ) : (
                        <div className="kitty-transcript">
                          {messages.map((message) => {
                            const isLatestKitty = message.id === latestKitty?.id;
                            const showWorking = busy && message.id === latestUser?.id;
                            return (
                              <div key={message.id}>
                                {!busy && isLatestKitty ? (
                                  <KittyScene id={latestPose} status="" compact />
                                ) : null}
                                <article className={`kitty-turn kitty-${message.role}`}>
                                  <span className="kitty-turn-label">{message.role}</span>
                                  <KittyMessageText text={message.text} />
                                  {message.kind === "question" && message.options?.length ? (
                                    <div className="kitty-options">
                                      {message.options.map((option) => (
                                        <button
                                          key={option}
                                          type="button"
                                          disabled={busy || Boolean(message.selected)}
                                          data-selected={message.selected === option}
                                          onClick={() => selectOption(message.id, option)}
                                        >
                                          <span>{option}</span>
                                          <i aria-hidden="true">↗</i>
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                  {message.kind === "error" &&
                                    isLatestKitty &&
                                    retry?.errorId === message.id ? (
                                      <button
                                        type="button"
                                        className="kitty-retry"
                                        disabled={rateLimited}
                                        onClick={retryLast}
                                      >
                                        retry <i aria-hidden="true">↗</i>
                                      </button>
                                    ) : null}
                                </article>
                                {showWorking ? (
                                  <KittyScene
                                    id={phase === "working" ? "8273687" : "8273689"}
                                    status={liveStatus}
                                    compact={phase === "streaming"}
                                  />
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

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
      className={`kitty-scene${compact ? " is-compact" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: displayedId ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.28, ease: EASE }}
      aria-hidden="true"
    >
      <AnimatePresence initial={false} mode="sync">
        {displayedId ? (
          <motion.span
            key={displayedId}
            className="kitty-scene-pose"
            initial={reduced ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -2 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: EASE }}
          >
            <KittyArt id={displayedId} />
          </motion.span>
        ) : null}
      </AnimatePresence>
      <span className="kitty-ledge" />
      <span className="kitty-status">{status}</span>
    </motion.div>
  );
}

const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;

function KittyMessageText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(text.slice(cursor, index));

    const rawUrl = match[2] ?? match[3];
    if (!rawUrl) continue;
    const trailing = match[3]?.match(/[.,!?;:]+$/)?.[0] ?? "";
    const url = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;
    parts.push(
      <a key={`${index}-${url}`} href={url} target="_blank" rel="noreferrer">
        {match[1] ?? url}
      </a>,
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

function KittyEmpty({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="kitty-empty">
      <KittyScene id="8273689" status="" />
      <p className="kitty-intro">Ask about a project, the stack, or why I built it.</p>
      <div className="kitty-prompts" aria-label="suggested questions">
        {SUGGESTIONS.map((question) => (
          <button key={question} type="button" onClick={() => onAsk(question)}>
            <span>{question}</span>
            <i aria-hidden="true">↗</i>
          </button>
        ))}
      </div>
    </div>
  );
}
