"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { site } from "@/data/site";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] grid place-items-start justify-items-center bg-bg/60 pt-[18vh] backdrop-blur-sm"
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
              className="overflow-hidden rounded-lg border border-line bg-bg shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)]"
            >
              <Command.Input
                autoFocus
                placeholder="type a command…"
                className="w-full border-b border-line bg-transparent px-5 py-4 font-mono text-[13px] text-fg outline-none placeholder:text-faint"
              />
              <Command.List className="max-h-[300px] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-6 text-center font-mono text-xs text-faint">
                  nothing found.
                </Command.Empty>

                <Group heading="go to">
                  <Item onSelect={() => run(() => router.push("/"))}>home</Item>
                  <Item onSelect={() => run(() => router.push("/work"))}>
                    work
                  </Item>
                  <Item onSelect={() => run(() => router.push("/about"))}>
                    about
                  </Item>
                </Group>

                <Group heading="actions">
                  <Item
                    onSelect={() =>
                      run(() =>
                        setTheme(resolvedTheme === "dark" ? "light" : "dark")
                      )
                    }
                  >
                    toggle theme
                  </Item>
                  <Item onSelect={copyEmail}>
                    {copied ? "copied ✓" : "copy email"}
                  </Item>
                  <Item
                    onSelect={() =>
                      run(() => window.open(site.links.resume, "_blank"))
                    }
                  >
                    download résumé
                  </Item>
                </Group>

                <Group heading="elsewhere">
                  <Item
                    onSelect={() =>
                      run(() => window.open(site.links.github, "_blank"))
                    }
                  >
                    github ↗
                  </Item>
                  <Item
                    onSelect={() =>
                      run(() => window.open(site.links.linkedin, "_blank"))
                    }
                  >
                    linkedin ↗
                  </Item>
                </Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-faint"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="cursor-pointer rounded-md px-3 py-2.5 font-mono text-[13px] text-muted transition-colors duration-150 data-[selected=true]:bg-surface data-[selected=true]:text-fg"
    >
      {children}
    </Command.Item>
  );
}
