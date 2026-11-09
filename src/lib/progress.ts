import type { Entries, Entry } from "./types";
import { quotes } from "./quotes";

export const STORAGE_PREFIX = "quizverse:v2:";
// Export-only compatibility for removed features; never recreate their records.
export function isRetiredProgressKey(key: string) {
  return /^(note:|bookmark:|highlight:|recent:|card:|study:|legacyNote:|legacy:(userNotes|bookmarks|highlightedText|recentTopics|learnedCards|difficultCards|flashcardStreak|lastStudyDate|totalStudyTime)$)/.test(
    key,
  );
}
export function readRetiredDeviceData(uid?: string): Record<string, unknown> {
  const prefix = `quizverse:draft:${encodeURIComponent(uid || "guest")}:`;
  const values: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      try {
        values[key] = JSON.parse(raw || "null");
      } catch {
        values[key] = raw;
      }
    }
  } catch {
    /* Existing device data remains untouched if storage is unavailable. */
  }
  return values;
}
export function clearRetiredDeviceData(uid?: string) {
  Object.keys(readRetiredDeviceData(uid)).forEach((key) =>
    localStorage.removeItem(key),
  );
}
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
    return validateEntries(data);
  } catch {
    return {};
  }
}
export function validateEntries(data: unknown): Entries {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  return Object.fromEntries(
    Object.entries(data).flatMap(([key, raw]) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const entry = raw as Entry;
      if (
        !Number.isFinite(entry.updatedAt) ||
        entry.updatedAt <= 0 ||
        !("value" in entry) ||
        (entry.deleted !== undefined && typeof entry.deleted !== "boolean")
      )
        return [];
      if (entry.deleted)
        return [
          [key, { value: null, updatedAt: entry.updatedAt, deleted: true }],
        ];
      const v = entry.value;
      const record =
        v && typeof v === "object" && !Array.isArray(v)
          ? (v as Record<string, unknown>)
          : null;
      if (key === "profile") {
        if (!record) return [];
        const profile = Object.fromEntries(
          ["name", "country", "age", "level", "gender"].map((field) => [
            field,
            typeof record[field] === "string" ? record[field].slice(0, 60) : "",
          ]),
        );
        return [[key, { ...entry, value: profile }]];
      }
      if (key === "settings") {
        if (!record) return [];
        return [
          [
            key,
            {
              ...entry,
              value: {
                theme: record.theme === "dark" ? "dark" : "light",
                language: record.language === "ur" ? "ur" : "en",
                sound: record.sound !== false,
                vibration: record.vibration !== false,
              },
            },
          ],
        ];
      }
      if (
        key.startsWith("result:") &&
        (!record ||
          !["id", "date", "title", "category"].every(
            (field) => typeof record[field] === "string",
          ) ||
          !["score", "total", "seconds", "skipped"].every((field) =>
            Number.isFinite(record[field]),
          ))
      )
        return [];
      if (
        key.startsWith("personality:") &&
        (!record ||
          !["id", "date", "title", "result"].every(
            (field) => typeof record[field] === "string",
          ))
      )
        return [];
      if (key.startsWith("activity:") && typeof v !== "string") return [];
      if (key.startsWith("quote:") && typeof v !== "boolean") return [];
      return [[key, entry]];
    }),
  ) as Entries;
}
// Legacy passwords are discarded, never copied to a new profile or sent to Firebase.
export function migrateLegacy(): Entries {
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
  // Scrub old passwords even when a v2 cache already exists.
  if (profile && typeof profile === "object" && "password" in profile) {
    delete profile.password;
    try {
      localStorage.setItem("quizverse_profile", JSON.stringify(profile));
    } catch {
      /* Never copy passwords even when storage is blocked. */
    }
  }
  const existing = readEntries();
  if (localStorage.getItem(storageKey()) !== null)
    return restoreQuoteFavorites(existing);
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
  });
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
    "userNotes",
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
  return restoreQuoteFavorites(validateEntries(entries));
}
export function restoreQuoteFavorites(entries: Entries): Entries {
  const legacy = entries["legacy:favoriteQuotes"];
  if (!legacy || legacy.deleted || !Array.isArray(legacy.value)) return entries;
  const next = { ...entries };
  for (const raw of legacy.value) {
    try {
      const favorite = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (
        !favorite ||
        typeof favorite.text !== "string" ||
        typeof favorite.author !== "string"
      )
        continue;
      const id = quotes.findIndex(
        (quote) =>
          quote.text === favorite.text && quote.author === favorite.author,
      );
      if (id >= 0 && !next[`quote:${id}`])
        next[`quote:${id}`] = { value: true, updatedAt: legacy.updatedAt };
    } catch {
      /* Unrecognized legacy records remain in the export. */
    }
  }
  return next;
}
