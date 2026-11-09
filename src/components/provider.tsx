"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  waitForPendingWrites,
} from "firebase/firestore";
import { SyncClock, withTimeout } from "@/lib/clock";
import { localDay } from "@/lib/quiz";
import { firebaseServices, friendlyError } from "@/lib/firebase";
import {
  mergeEntries,
  migrateLegacy,
  readEntries,
  storageKey,
  validateEntries,
} from "@/lib/progress";
import type { Entries, Entry, Language, Profile } from "@/lib/types";

export interface Settings {
  theme: "light" | "dark";
  language: Language;
  sound: boolean;
  vibration: boolean;
  fontSize: number;
}
const defaults: Settings = {
  theme: "light",
  language: "en",
  sound: true,
  vibration: true,
  fontSize: 18,
};
const guest: Profile = {
  name: "Guest",
  country: "",
  age: "",
  level: "",
  gender: "",
};
interface AppState {
  user: User | null;
  ready: boolean;
  entries: Entries;
  error: string;
  sync: string;
  settings: Settings;
  profile: Profile;
  set: (key: string, value: unknown, deleted?: boolean) => boolean;
  get: <T>(key: string, fallback: T) => T;
  list: <T>(prefix: string) => T[];
  updateSettings: (value: Partial<Settings>) => void;
  importGuest: () => void;
  retrySync: () => void;
  flushSync: () => Promise<void>;
  recordStudy: (seconds: number) => void;
}
const Context = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState<Entries>({});
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [sync, setSync] = useState("Loading");
  const [retry, setRetry] = useState(0);
  const state = useRef<Entries>({});
  const activeUid = useRef<string | undefined>(undefined);
  const remoteReady = useRef(false);
  const inFlight = useRef(new Map<string, number>());
  const failed = useRef(new Map<string, number>());
  const clock = useRef(new SyncClock());
  const studyTab = useRef<string | null>(null);

  const persist = useCallback((next: Entries) => {
    state.current = next;
    setEntries(next);
    try {
      localStorage.setItem(storageKey(activeUid.current), JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError(
        "Device storage is unavailable or full. Keep this page open and export your progress from your profile.",
      );
    }
  }, []);

  const upload = useCallback((key: string, entry: Entry) => {
    const uid = activeUid.current;
    if (
      !uid ||
      !remoteReady.current ||
      inFlight.current.get(`${uid}:${key}`) === entry.updatedAt
    )
      return;
    const pendingKey = `${uid}:${key}`;
    inFlight.current.set(pendingKey, entry.updatedAt);
    setSync("Syncing");
    try {
      const { db } = firebaseServices();
      void setDoc(
        doc(db, "quizverse_users", uid, "entries", encodeURIComponent(key)),
        entry,
      )
        .then(() => {
          if (
            activeUid.current === uid &&
            inFlight.current.get(pendingKey) === entry.updatedAt
          ) {
            failed.current.delete(pendingKey);
            const otherPending = [...inFlight.current.keys()].some(
              (key) => key.startsWith(`${uid}:`) && key !== pendingKey,
            );
            const hasFailure = [...failed.current.keys()].some((key) =>
              key.startsWith(`${uid}:`),
            );
            setSync(
              hasFailure
                ? "Saved locally"
                : otherPending
                  ? "Syncing"
                  : "Synced",
            );
            if (!hasFailure) setError("");
          }
        })
        .catch((e) => {
          if (activeUid.current === uid) {
            if (inFlight.current.get(pendingKey) !== entry.updatedAt) return;
            failed.current.set(pendingKey, entry.updatedAt);
            setError(friendlyError(e));
            setSync("Saved locally");
          }
        })
        .finally(() => {
          if (inFlight.current.get(pendingKey) === entry.updatedAt)
            inFlight.current.delete(pendingKey);
        });
    } catch (e) {
      inFlight.current.delete(pendingKey);
      setError(friendlyError(e));
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      persist(migrateLegacy());
    } catch {
      setStorageError(
        "Browser storage is unavailable. Guest progress will remain in this tab only; export it before closing.",
      );
    }
    try {
      const { auth } = firebaseServices();
      unsubscribe = onAuthStateChanged(
        auth,
        (nextUser) => {
          remoteReady.current = false;
          activeUid.current = nextUser?.uid;
          setUser(nextUser);
          persist(readEntries(nextUser?.uid));
          setSync(nextUser ? "Connecting" : "Guest · saved on this device");
          setReady(true);
        },
        (e) => {
          setError(friendlyError(e));
          setReady(true);
        },
      );
    } catch (e) {
      setError(friendlyError(e));
      setReady(true);
      setSync("Guest · saved on this device");
    }
    return () => unsubscribe();
  }, [persist]);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let unsubscribe = () => {};
    let cancelled = false;
    async function connect() {
      try {
        const began = performance.now();
        const response = await fetch("/api/time", {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok)
          throw new Error(
            "Server time could not be checked. Retry sync or check your device clock.",
          );
        const { serverTime } = await response.json();
        clock.current.synchronize(serverTime, performance.now() - began);
        if (cancelled || activeUid.current !== uid) return;
        failed.current.clear();
        const { db } = firebaseServices();
        unsubscribe = onSnapshot(
          collection(db, "quizverse_users", uid, "entries"),
          { includeMetadataChanges: true },
          (snapshot) => {
            if (activeUid.current !== uid) return;
            const remote: Entries = {};
            const acknowledged: Entries = {};
            snapshot.docs.forEach((item) => {
              try {
                const key = decodeURIComponent(item.id);
                remote[key] = item.data() as Entry;
                if (!item.metadata.hasPendingWrites)
                  acknowledged[key] = remote[key];
              } catch {
                /* Ignore malformed document IDs without breaking valid records. */
              }
            });
            const validRemote = validateEntries(remote);
            const validAcknowledged = validateEntries(acknowledged);
            const local = { ...state.current };
            // Only repair unacknowledged, far-future local timestamps. Server
            // records are never rewritten merely because a device clock differs.
            for (const [key, entry] of Object.entries(local)) {
              if (
                !snapshot.metadata.fromCache &&
                entry.updatedAt > clock.current.now() + 300000 &&
                (!validAcknowledged[key] ||
                  entry.updatedAt > validAcknowledged[key].updatedAt)
              ) {
                local[key] = {
                  ...entry,
                  updatedAt: Math.max(
                    clock.current.now(),
                    (validAcknowledged[key]?.updatedAt || 0) + 1,
                  ),
                };
              }
            }
            persist(mergeEntries(local, validRemote));
            // Cached snapshots do not prove which records exist remotely.
            if (snapshot.metadata.fromCache) {
              setSync("Saved locally · waiting for cloud");
              return;
            }
            remoteReady.current = true;
            for (const [key, timestamp] of failed.current) {
              const rawKey = key.slice(uid.length + 1);
              if (validAcknowledged[rawKey]?.updatedAt >= timestamp)
                failed.current.delete(key);
            }
            const hasFailure = [...failed.current.keys()].some((key) =>
              key.startsWith(`${uid}:`),
            );
            if (!hasFailure) setError("");
            setSync(
              hasFailure
                ? "Saved locally"
                : snapshot.metadata.hasPendingWrites
                  ? "Syncing"
                  : "Synced",
            );
            for (const [key, entry] of Object.entries(state.current)) {
              if (
                (!validRemote[key] ||
                  entry.updatedAt > validRemote[key].updatedAt) &&
                failed.current.get(`${uid}:${key}`) !== entry.updatedAt
              )
                upload(key, entry);
            }
          },
          (e) => {
            if (activeUid.current === uid) {
              remoteReady.current = false;
              setError(friendlyError(e));
              setSync("Saved locally");
            }
          },
        );
      } catch (e) {
        if (!cancelled && activeUid.current === uid) {
          setError(friendlyError(e));
          setSync("Saved locally");
        }
      }
    }
    void connect();
    return () => {
      cancelled = true;
      remoteReady.current = false;
      unsubscribe();
    };
  }, [user, persist, upload, retry]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey(activeUid.current)) return;
      const incoming = readEntries(activeUid.current);
      const previous = state.current;
      const next = mergeEntries(state.current, incoming);
      // Do not write back here: that would create a cross-tab storage-event loop.
      state.current = next;
      setEntries(next);
      for (const [key, entry] of Object.entries(incoming)) {
        if (
          next[key] === entry &&
          JSON.stringify(entry) !== JSON.stringify(previous[key])
        )
          upload(key, entry);
      }
    };
    const onOnline = () => setRetry((x) => x + 1);
    window.addEventListener("storage", onStorage);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("online", onOnline);
    };
  }, [upload]);

  const set = useCallback(
    (key: string, value: unknown, deleted = false) => {
      // A timer/editor from the previous account must not write into a new one.
      if (activeUid.current !== user?.uid) return false;
      const entry: Entry = {
        value,
        updatedAt: Math.max(
          clock.current.now(),
          (state.current[key]?.updatedAt || 0) + 1,
        ),
        ...(deleted ? { deleted: true } : {}),
      };
      persist({ ...state.current, [key]: entry });
      upload(key, entry);
      return true;
    },
    [persist, upload, user?.uid],
  );
  const recordStudy = useCallback(
    (seconds: number) => {
      if (
        !Number.isFinite(seconds) ||
        seconds <= 0 ||
        activeUid.current !== user?.uid
      )
        return;
      if (!studyTab.current) {
        try {
          studyTab.current =
            sessionStorage.getItem("quizverse:study-tab") ||
            crypto.randomUUID();
          sessionStorage.setItem("quizverse:study-tab", studyTab.current);
        } catch {
          studyTab.current = crypto.randomUUID();
        }
      }
      const key = `study:${localDay()}:${studyTab.current}`;
      const previous = state.current[key];
      const total =
        previous && !previous.deleted && typeof previous.value === "number"
          ? previous.value
          : 0;
      set(key, total + Math.floor(seconds));
    },
    [set, user?.uid],
  );
  function get<T>(key: string, fallback: T): T {
    return entries[key] && !entries[key].deleted
      ? (entries[key].value as T)
      : fallback;
  }
  function list<T>(prefix: string): T[] {
    return Object.entries(entries)
      .filter(([key, entry]) => key.startsWith(prefix) && !entry.deleted)
      .map(([, entry]) => entry.value as T);
  }
  const settings = { ...defaults, ...get<Partial<Settings>>("settings", {}) };
  const profile = get<Profile>("profile", {
    ...guest,
    name: user?.displayName || "Guest",
  });
  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark",
    );
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === "ur" ? "rtl" : "ltr";
    try {
      localStorage.setItem("theme", settings.theme);
    } catch {
      /* Main storage warning already covers this. */
    }
  }, [ready, settings.theme, settings.language]);
  const importGuest = () => {
    if (!user) return;
    for (const [key, entry] of Object.entries(readEntries())) {
      if (!entries[key] && !entry.deleted) set(key, entry.value);
    }
  };
  async function flushSync() {
    if (!user) return;
    if (
      !remoteReady.current ||
      !navigator.onLine ||
      [...failed.current.keys()].some((key) => key.startsWith(`${user.uid}:`))
    ) {
      throw new Error(
        "Some changes are still local. Retry sync or export a backup before signing out.",
      );
    }
    await withTimeout(
      waitForPendingWrites(firebaseServices().db),
      8000,
      "Cloud sync is taking too long. Your local backup has not been cleared.",
    );
    if (
      [...failed.current.keys()].some((key) => key.startsWith(`${user.uid}:`))
    )
      throw new Error(
        "Cloud sync failed. Your local backup has not been cleared.",
      );
  }
  return (
    <Context.Provider
      value={{
        user,
        ready,
        entries,
        error: [storageError, error].filter(Boolean).join(" "),
        sync,
        settings,
        profile,
        set,
        get,
        list,
        importGuest,
        flushSync,
        recordStudy,
        retrySync: () => setRetry((x) => x + 1),
        updateSettings: (value) => set("settings", { ...settings, ...value }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const context = useContext(Context);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
