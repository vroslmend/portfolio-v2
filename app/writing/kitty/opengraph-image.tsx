import { createEssayOpenGraph, ESSAY_OG_SIZE } from "@/lib/essay-og";

export const alt = "A quiet cat, with a complicated backend";
export const size = ESSAY_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return createEssayOpenGraph({
    title: alt,
    eyebrow: "writing · september 2026",
    kind: "an agent case study",
    titleSize: 60,
    titleWidth: 980,
  });
}
