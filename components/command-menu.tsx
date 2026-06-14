"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { EASE } from "@/lib/motion";
import { PixelPrius } from "@/components/pixel-prius";
import { site } from "@/data/site";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [driving, setDriving] = useState<"off" | "cruise" | "rally">("off");
  const [denied, setDenied] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const q = search.trim().toLowerCase();

  const listRef = useRef<HTMLDivElement>(null);
  const hlTop = useSpring(0, { stiffness: 620, damping: 46, mass: 0.7 });
  const hlHeight = useSpring(0, { stiffness: 620, damping: 46, mass: 0.7 });
  const hlOpacity = useMotionValue(0);
  const placed = useRef(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearch("");
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpenEvent() {
      setSearch("");
      setOpen(true);
    }
    function onDrivePrius() {
      setDriving("cruise");
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", onOpenEvent);
    window.addEventListener("drive-prius", onDrivePrius);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", onOpenEvent);
      window.removeEventListener("drive-prius", onDrivePrius);
    };
  }, []);

  // glide the box to the selected row. cmdk moves the data-selected attribute
  // imperatively (it fires no React event for keyboard nav in uncontrolled
  // mode), so we watch that attribute and spring toward whichever row carries
  // it — event-driven, so there's no per-frame layout polling.
  useLayoutEffect(() => {
    if (!open) {
      placed.current = false;
      return;
    }
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const item = list.querySelector<HTMLElement>('[data-selected="true"]');
      if (!item) {
        hlOpacity.set(0);
        return;
      }
      if (placed.current) {
        hlTop.set(item.offsetTop);
        hlHeight.set(item.offsetHeight);
      } else {
        // first paint: snap into place rather than sliding in from the top
        hlTop.jump(item.offsetTop);
        hlHeight.jump(item.offsetHeight);
        placed.current = true;
      }
      hlOpacity.set(1);
    };

    // coalesce the two attribute writes per move (old row clears, new row sets)
    // into a single measure on the next frame, once the DOM has settled
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure(); // place it on the initial selection before first paint
    const obs = new MutationObserver(schedule);
    obs.observe(list, {
      attributes: true,
      attributeFilter: ["data-selected"],
      subtree: true,
    });
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [open, hlTop, hlHeight, hlOpacity]);

  function run(action: () => void) {
    action();
    setOpen(false);
  }

  async function copyEmail() {
    await navigator.clipboard.writeText(site.email);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 900);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-110 grid place-items-start justify-items-center bg-bg/60 pt-[18vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="w-[min(480px,calc(100vw-32px))]"
            >
              <Command
                label="command menu"
                className="overflow-hidden rounded-lg border border-line bg-bg shadow-[0_24px_80px_-24px_var(--shadow-dialog)]"
              >
                <Command.Input
                  autoFocus
                  value={search}
                  onValueChange={setSearch}
                  placeholder="type a command…"
                  className="w-full border-b border-line bg-transparent px-5 py-4 font-mono text-[13px] text-fg outline-none placeholder:text-faint"
                />
                <Command.List
                  ref={listRef}
                  className="relative max-h-[min(420px,55vh)] overflow-y-auto p-2"
                >
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-2 z-0 rounded-md bg-surface"
                    style={{ top: hlTop, height: hlHeight, opacity: hlOpacity }}
                  />

                  <Command.Empty className="px-3 py-6 text-center font-mono text-xs text-faint">
                    nothing found.
                  </Command.Empty>

                  <Group heading="go to">
                    <Item value="home" onSelect={() => run(() => router.push("/"))}>
                      home
                    </Item>
                    <Item value="work" onSelect={() => run(() => router.push("/work"))}>
                      work
                    </Item>
                    <Item
                      value="writing"
                      onSelect={() => run(() => router.push("/writing"))}
                    >
                      writing
                    </Item>
                    <Item
                      value="about"
                      onSelect={() => run(() => router.push("/about"))}
                    >
                      about
                    </Item>
                  </Group>

                  <Group heading="actions">
                    <Item
                      value="toggle theme"
                      onSelect={() =>
                        run(() =>
                          setTheme(resolvedTheme === "dark" ? "light" : "dark")
                        )
                      }
                    >
                      toggle theme
                    </Item>
                    <Item value="copy email" onSelect={copyEmail}>
                      <SwapText text={copied ? "copied ✓" : "copy email"} />
                    </Item>
                    <Item
                      value="download resume"
                      onSelect={() =>
                        run(() => window.open(site.links.resume, "_blank"))
                      }
                    >
                      download resume
                    </Item>
                  </Group>

                  {(q === "prius" || q === "rally" || q === "sudo") && (
                    <Group heading="???">
                      {q === "prius" && (
                        <Item
                          value="start the prius"
                          onSelect={() => run(() => setDriving("cruise"))}
                        >
                          start the prius
                        </Item>
                      )}
                      {q === "rally" && (
                        <Item
                          value="rally full send"
                          onSelect={() => run(() => setDriving("rally"))}
                        >
                          full send
                        </Item>
                      )}
                      {q === "sudo" && (
                        <Item
                          value="sudo"
                          onSelect={() => {
                            setDenied(true);
                            setTimeout(() => {
                              setDenied(false);
                              setOpen(false);
                            }, 1100);
                          }}
                        >
                          <SwapText
                            text={denied ? "permission denied, nice try" : "sudo"}
                          />
                        </Item>
                      )}
                    </Group>
                  )}

                  <Group heading="elsewhere">
                    <Item
                      value="github"
                      onSelect={() =>
                        run(() => window.open(site.links.github, "_blank"))
                      }
                    >
                      github ↗
                    </Item>
                    <Item
                      value="linkedin"
                      onSelect={() =>
                        run(() => window.open(site.links.linkedin, "_blank"))
                      }
                    >
                      linkedin ↗
                    </Item>
                  </Group>
                </Command.List>

                <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10px] tracking-[0.08em] text-faint select-none">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Key>↑↓</Key> navigate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Key>↵</Key> select
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <Key>esc</Key> close
                  </span>
                </div>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {driving !== "off" && (
        <PixelPrius fast={driving === "rally"} onDone={() => setDriving("off")} />
      )}
    </>
  );
}

function Group({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Command.Group
      heading={heading}
      className="**:[[cmdk-group-heading]]:relative **:[[cmdk-group-heading]]:z-20 **:[[cmdk-group-heading]]:bg-bg **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:pt-3 **:[[cmdk-group-heading]]:font-mono **:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.16em] **:[[cmdk-group-heading]]:text-faint"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  children,
  onSelect,
  value,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  value: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="group relative z-10 flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 font-mono text-[13px] text-muted transition-colors duration-150 data-[selected=true]:text-fg"
    >
      <span className="min-w-0 truncate">{children}</span>
      <span
        aria-hidden
        className="shrink-0 -translate-x-1 text-faint opacity-0 transition-[opacity,transform] duration-200 ease-out group-data-[selected=true]:translate-x-0 group-data-[selected=true]:opacity-100"
      >
        ↵
      </span>
    </Command.Item>
  );
}

/** Crossfades inline text when it changes (copy email -> copied, sudo -> denied). */
function SwapText({ text }: { text: string }) {
  return (
    <span className="relative inline-flex">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: EASE }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="grid min-w-[16px] place-items-center rounded border border-line px-1 py-px text-[10px] not-italic leading-none text-muted">
      {children}
    </kbd>
  );
}
