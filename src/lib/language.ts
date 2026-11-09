import type { Language } from "./types";
export function contentLocale(
  en: string,
  ur: string | undefined,
  preferred: Language,
) {
  const translated =
    preferred === "ur" && typeof ur === "string" && ur.trim().length > 0;
  return {
    text: translated ? ur : en,
    lang: translated ? "ur" : "en",
    dir: translated ? "rtl" : "ltr",
  } as const;
}
