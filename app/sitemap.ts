import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/work",
    "/work-with-me",
    "/about",
    "/photos",
    "/writing",
    "/writing/kitty",
    "/writing/now-playing",
    "/writing/visitor-counter",
    "/writing/agentic-bookkeeping",
  ];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
