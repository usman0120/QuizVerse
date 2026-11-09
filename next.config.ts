import type { NextConfig } from "next";

const routes: Record<string, string> = {
  index: "/",
  "quiz-categories": "/quizzes",
  quiz: "/quiz",
  "learning-categories": "/learning",
  learn: "/learn",
  flashcards: "/flashcards",
  personality: "/personality",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
};

const config: NextConfig = {
  // Preserve unrelated output from earlier migration attempts.
  distDir: ".next-build",
  poweredByHeader: false,
  outputFileTracingIncludes: { "/**": ["./data/**/*.json"] },
  async redirects() {
    return Object.entries(routes).map(([name, destination]) => ({
      source: `/${name}.html`,
      destination,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};
export default config;
