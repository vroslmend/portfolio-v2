import { createEssayOpenGraph, ESSAY_OG_SIZE } from "@/lib/essay-og";

export const alt = "Putting my Spotify on the page, without overdoing it";
export const size = ESSAY_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return createEssayOpenGraph({
    title: alt,
    eyebrow: "writing · june 2026",
    kind: "a build note",
    titleSize: 60,
    titleWidth: 980,
  });
}
