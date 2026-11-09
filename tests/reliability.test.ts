import { test } from "node:test";
import assert from "node:assert/strict";
import { SyncClock, withTimeout } from "../src/lib/clock";
import {
  validateEntries,
  migrateLegacy,
  storageKey,
  restoreQuoteFavorites,
} from "../src/lib/progress";
import { quotes } from "../src/lib/quotes";
import {
  draftKey,
  parseDraft,
  readDraftRaw,
  scopeDrafts,
  writeDraft,
  clearScopeDrafts,
} from "../src/lib/drafts";

test("sync clock ignores incorrect and changing device time after server calibration", () => {
  let monotonic = 0;
  let device = 9999999999999;
  const clock = new SyncClock(
    () => monotonic,
    () => device,
  );
  assert.equal(clock.now(), device);
  clock.synchronize(1000000, 100);
  monotonic = 500;
  device = 1;
  assert.equal(clock.now(), 1000550);
  assert.throws(() => clock.synchronize(NaN));
});
test("flush timeout rejects without waiting forever; successful flush resolves", async () => {
  assert.equal(await withTimeout(Promise.resolve(42), 100, "timeout"), 42);
  await assert.rejects(
    withTimeout(new Promise(() => {}), 5, "backup retained"),
    /backup retained/,
  );
});
test("bad cache records do not discard valid progress; profiles never contain passwords", () => {
  const entries = validateEntries({
    broken: "not an entry",
    note: { updatedAt: 1, value: "safe" },
    profile: { updatedAt: 2, value: { name: "Learner", password: "secret" } },
    settings: { updatedAt: 3, value: { language: "invalid", fontSize: -50 } },
    "result:x": { updatedAt: 4, value: null },
  });
  assert.equal(entries.note.value, "safe");
  assert.equal(entries.broken, undefined);
  assert.equal(JSON.stringify(entries).includes("secret"), false);
  assert.deepEqual(entries.settings.value, {
    theme: "light",
    language: "en",
    fontSize: 14,
    sound: true,
    vibration: true,
  });
  assert.equal(entries["result:x"], undefined);
});
test("legacy passwords are scrubbed even when v2 progress already exists", () => {
  const records = new Map([
    [storageKey(), "{}"],
    [
      "quizverse_profile",
      JSON.stringify({ name: "Guest", password: "secret" }),
    ],
  ]);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => records.get(key) ?? null,
      setItem: (key: string, value: string) => records.set(key, value),
    },
  });
  migrateLegacy();
  assert.equal(
    JSON.parse(records.get("quizverse_profile")!).password,
    undefined,
  );
});
test("note drafts remain isolated, recoverable, and clearable with blocked storage", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
      get length() {
        throw new Error("blocked");
      },
    },
  });
  const key = draftKey("alice", "science:intro");
  writeDraft(key, { text: "An unsaved note", baseUpdatedAt: 5 });
  assert.equal(parseDraft(readDraftRaw(key))?.text, "An unsaved note");
  assert.equal(readDraftRaw(draftKey("bob", "science:intro")), null);
  assert.equal(Object.keys(scopeDrafts("alice")).length, 1);
  clearScopeDrafts("alice");
  assert.equal(readDraftRaw(key), null);
});
test("recognized old favorites are restored without undoing an explicit removal", () => {
  const entries = {
    "legacy:favoriteQuotes": {
      updatedAt: 1,
      value: [JSON.stringify(quotes[0]), JSON.stringify(quotes[1])],
    },
    "quote:1": { updatedAt: 2, value: false },
  };
  const restored = restoreQuoteFavorites(entries);
  assert.equal(restored["quote:0"].value, true);
  assert.equal(restored["quote:1"].value, false);
});
