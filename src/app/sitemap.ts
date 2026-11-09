import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl;
  if (!site) return [];
  return [
    "",
    "/quizzes",
    "/flashcards",
    "/personality",
    "/leaderboard",
    "/about",
    "/privacy",
    "/terms",
    "/cookies",
  ].map((route) => ({
    url: `${site.replace(/\/$/, "")}${route}`,
    changeFrequency: route ? "monthly" : "daily",
    priority: route ? 0.7 : 1,
  }));
}
