import type { Entries, Entry } from "./types";

export const STORAGE_PREFIX = "quizverse:v2:";
export function mergeEntries(local: Entries, remote: Entries): Entries {
  const merged = { ...local };
  for (const [key, entry] of Object.entries(remote)) {
    if (!merged[key] || entry.updatedAt >= merged[key].updatedAt)
      merged[key] = entry;
  }
  return merged;
}
export function storageKey(uid?: string) {
  return `${STORAGE_PREFIX}${uid || "guest"}`;
}
export function readEntries(uid?: string): Entries {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey(uid)) || "{}");
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return Object.fromEntries(
      Object.entries(data).filter(([, entry]) => {
        const e = entry as Entry;
        return e && typeof e.updatedAt === "number" && "value" in e;
      }),
    ) as Entries;
  } catch {
    return {};
  }
}
// Legacy passwords are discarded, never copied to a new profile or sent to Firebase.
export function migrateLegacy(): Entries {
  const existing = readEntries();
  if (localStorage.getItem(storageKey()) !== null) return existing;
  const entries: Entries = {};
  const set = (key: string, value: unknown) => {
    entries[key] = { value, updatedAt: 1 };
  };
  const parse = (key: string) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };
  const profile = parse("quizverse_profile");
  if (profile && typeof profile === "object") {
    set("profile", {
      name: String(profile.name || "Guest").slice(0, 60),
      country: String(profile.country || ""),
      age: String(profile.age || ""),
      level: String(profile.level || ""),
      gender: String(profile.gender || ""),
    });
    if ("password" in profile) {
      delete profile.password;
      try {
        localStorage.setItem("quizverse_profile", JSON.stringify(profile));
      } catch {
        /* Storage error is surfaced by the provider. */
      }
    }
    if (profile.quizStats) set("legacyStats", profile.quizStats);
  }
  const theme = localStorage.getItem("theme");
  const language =
    localStorage.getItem("preferredLanguage") ||
    localStorage.getItem("language");
  set("settings", {
    theme:
      theme === "dark" ||
      (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light",
    language: language === "ur" ? "ur" : "en",
    sound: localStorage.getItem("soundEnabled") !== "false",
    vibration: localStorage.getItem("vibrationEnabled") !== "false",
    fontSize: Number(localStorage.getItem("fontSize")) || 18,
  });
  const notes = parse("userNotes");
  if (notes && typeof notes === "object") {
    const ids = [
      "science-nature",
      "islamic-studies",
      "ancient-civilizations",
      "english-grammar",
      "ethics-manners",
      "famous-poets",
      "human-body",
      "kids-animals",
      "kids-shapes",
      "national-heroes",
      "pakistani-culture",
      "pakistani-food",
      "prophets-stories",
      "quran-hadith",
      "safety-tips",
      "tareekh-e-pakistan",
      "urdu-literature",
      "urdu-poetry",
      "urdu-proverbs",
      "biology",
      "history",
      "mughals",
      "physics",
      "sahabah",
    ];
    for (const [key, value] of Object.entries(notes)) {
      const categoryId = ids.find((id) => key.startsWith(`${id}-`));
      if (categoryId && typeof value === "string") {
        const topicId = key.slice(categoryId.length + 1);
        set(`note:${categoryId}:${topicId}`, {
          categoryId,
          topicId,
          title: topicId,
          text: value,
        });
      } else set(`legacyNote:${key}`, value);
    }
  }
  const bookmarks = parse("bookmarks");
  if (Array.isArray(bookmarks))
    for (const item of bookmarks) {
      if (item.categoryId && item.sectionId)
        set(`bookmark:${item.categoryId}:${item.sectionId}`, {
          categoryId: item.categoryId,
          topicId: item.sectionId,
          title:
            typeof item.sectionName === "string"
              ? item.sectionName
              : item.sectionName?.en || item.sectionId,
        });
    }
  const history = parse("quizHistory");
  if (Array.isArray(history))
    history.forEach((item, i) => {
      if (typeof item.quiz === "string" && typeof item.result === "string")
        set(`personality:legacy-${i}`, {
          id: `legacy-${i}`,
          quizId: "",
          title: item.quiz,
          result: item.result,
          date: item.date || new Date(0).toISOString(),
        });
    });
  for (const key of [
    "bookmarks",
    "highlightedText",
    "learnedCards",
    "difficultCards",
    "favoriteQuotes",
    "quizHistory",
    "personalityQuizHistory",
  ]) {
    const value = parse(key);
    if (value) set(`legacy:${key}`, value);
  }
  return entries;
}
