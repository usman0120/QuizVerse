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
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { firebaseServices, friendlyError } from "@/lib/firebase";
import {
  mergeEntries,
  migrateLegacy,
  readEntries,
  storageKey,
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
  set: (key: string, value: unknown, deleted?: boolean) => void;
  get: <T>(key: string, fallback: T) => T;
  list: <T>(prefix: string) => T[];
  updateSettings: (value: Partial<Settings>) => void;
  importGuest: () => void;
  retrySync: () => void;
}
const Context = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState<Entries>({});
  const [error, setError] = useState("");
  const [sync, setSync] = useState("Loading");
  const [retry, setRetry] = useState(0);
  const state = useRef<Entries>({});
  const activeUid = useRef<string | undefined>(undefined);
  const remoteReady = useRef(false);
  const inFlight = useRef(new Map<string, number>());

  const persist = useCallback((next: Entries) => {
    state.current = next;
    setEntries(next);
    try {
      localStorage.setItem(storageKey(activeUid.current), JSON.stringify(next));
    } catch {
      setError(
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
          if (activeUid.current === uid) {
            const otherPending = [...inFlight.current.keys()].some(
              (key) => key.startsWith(`${uid}:`) && key !== pendingKey,
            );
            setSync(otherPending ? "Syncing" : "Synced");
            setError("");
          }
        })
        .catch((e) => {
          if (activeUid.current === uid) {
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
      const legacy = migrateLegacy();
      persist(legacy);
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
    try {
      const { db } = firebaseServices();
      unsubscribe = onSnapshot(
        collection(db, "quizverse_users", uid, "entries"),
        { includeMetadataChanges: true },
        (snapshot) => {
          if (activeUid.current !== uid) return;
          const remote: Entries = {};
          snapshot.docs.forEach((item) => {
            remote[decodeURIComponent(item.id)] = item.data() as Entry;
          });
          persist(mergeEntries(state.current, remote));
          // Cached snapshots do not prove which records exist remotely.
          if (snapshot.metadata.fromCache) {
            setSync("Saved locally · waiting for cloud");
            return;
          }
          remoteReady.current = true;
          setError("");
          setSync(snapshot.metadata.hasPendingWrites ? "Syncing" : "Synced");
          for (const [key, entry] of Object.entries(state.current)) {
            if (!remote[key] || entry.updatedAt > remote[key].updatedAt)
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
      setError(friendlyError(e));
    }
    return () => {
      remoteReady.current = false;
      unsubscribe();
    };
  }, [user, persist, upload, retry]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey(activeUid.current)) return;
      const incoming = readEntries(activeUid.current);
      const next = mergeEntries(state.current, incoming);
      // Do not write back here: that would create a cross-tab storage-event loop.
      state.current = next;
      setEntries(next);
      for (const [key, entry] of Object.entries(incoming)) upload(key, entry);
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
      const entry: Entry = {
        value,
        updatedAt: Math.max(
          Date.now(),
          (state.current[key]?.updatedAt || 0) + 1,
        ),
        ...(deleted ? { deleted: true } : {}),
      };
      persist({ ...state.current, [key]: entry });
      upload(key, entry);
    },
    [persist, upload],
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
  return (
    <Context.Provider
      value={{
        user,
        ready,
        entries,
        error,
        sync,
        settings,
        profile,
        set,
        get,
        list,
        importGuest,
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
