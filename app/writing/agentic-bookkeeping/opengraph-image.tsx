import { createEssayOpenGraph, ESSAY_OG_SIZE } from "@/lib/essay-og";

export const alt = "Agents that do bookkeeping, with humans where it matters";
export const size = ESSAY_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return createEssayOpenGraph({
    title: alt,
    eyebrow: "writing · may 2026",
    kind: "an architecture concept",
  });
}
