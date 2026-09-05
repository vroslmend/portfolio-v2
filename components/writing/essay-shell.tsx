"use client";

import { useRef, type ReactNode } from "react";
import { ReadingProgress } from "@/components/reading-progress";

export function EssayShell({ children }: { children: ReactNode }) {
  const article = useRef<HTMLElement>(null);

  return (
    <article ref={article} className="flex flex-col gap-10 pb-8">
      <ReadingProgress target={article} />
      {children}
    </article>
  );
}
