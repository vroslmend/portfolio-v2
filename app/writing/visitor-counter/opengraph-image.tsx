import { createEssayOpenGraph, ESSAY_OG_SIZE } from "@/lib/essay-og";

export const alt = "A visitor counter, taken too seriously";
export const size = ESSAY_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return createEssayOpenGraph({
    title: alt,
    eyebrow: "writing · june 2026",
    kind: "a build note",
  });
}
