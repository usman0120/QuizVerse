import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".next-build/**",
    "dist/**",
    "src/js/**",
    "next-env.d.ts",
    "test-results/**",
  ]),
  { rules: { "@next/next/no-img-element": "off" } },
  // These two components hydrate local storage / initialize an external SDK.
  {
    files: ["src/components/provider.tsx", "src/components/leaderboard.tsx"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  {
    files: ["*.config.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
