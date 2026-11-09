import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "");
  if (!site) return [];
  return [
    "",
    "/quizzes",
    "/learning",
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
