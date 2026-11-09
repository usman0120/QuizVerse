// Unsaved notes are device-only, separated by signed-in UID, and never uploaded
// until Save is chosen. This also keeps concurrent cloud edits from erasing a draft.
export interface NoteDraft {
  text: string;
  baseUpdatedAt: number;
}
const prefix = "quizverse:draft:";
const listeners = new Set<() => void>();
const memory = new Map<string, string | null>();
export function draftKey(uid: string | undefined, topic: string) {
  return `${prefix}${encodeURIComponent(uid || "guest")}:${encodeURIComponent(topic)}`;
}
export function readDraftRaw(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}
export function parseDraft(raw: string | null): NoteDraft | null {
  try {
    const value = JSON.parse(raw || "null");
    return value &&
      typeof value.text === "string" &&
      Number.isFinite(value.baseUpdatedAt)
      ? value
      : null;
  } catch {
    return null;
  }
}
export function writeDraft(key: string, draft: NoteDraft | null) {
  const raw = draft ? JSON.stringify(draft) : null;
  memory.set(key, raw);
  let stored = true;
  try {
    if (raw) localStorage.setItem(key, raw);
    else localStorage.removeItem(key);
  } catch {
    stored = false;
    /* In-memory fallback still protects navigation within this tab. */
  }
  listeners.forEach((listener) => listener());
  return stored;
}
export function subscribeDrafts(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (!event.key?.startsWith(prefix)) return;
    // A different tab's deletion must not be restored from the memory fallback.
    if (event.newValue) memory.set(event.key, event.newValue);
    else memory.delete(event.key);
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
export function scopeDrafts(uid?: string): Record<string, NoteDraft> {
  const scope = `${prefix}${encodeURIComponent(uid || "guest")}:`;
  const values = new Map<string, string | null>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(scope)) values.set(key, localStorage.getItem(key)!);
    }
  } catch {
    /* Memory remains available. */
  }
  memory.forEach((value, key) => values.set(key, value));
  return Object.fromEntries(
    [...values]
      .filter(([key]) => key.startsWith(scope))
      .flatMap(([key, raw]) => {
        const draft = parseDraft(raw);
        return draft ? [[key, draft]] : [];
      }),
  );
}
export function clearScopeDrafts(uid?: string) {
  Object.keys(scopeDrafts(uid)).forEach((key) => writeDraft(key, null));
}
