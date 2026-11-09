import { test } from "node:test";
import assert from "node:assert/strict";
import { SyncClock, withTimeout } from "../src/lib/clock";
import {
  validateEntries,
  migrateLegacy,
  storageKey,
  restoreQuoteFavorites,
  readRetiredDeviceData,
  clearRetiredDeviceData,
  isRetiredProgressKey,
} from "../src/lib/progress";
import { quotes } from "../src/lib/quotes";

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
    settings: { updatedAt: 3, value: { language: "invalid" } },
    "result:x": { updatedAt: 4, value: null },
  });
  assert.equal(entries.note.value, "safe");
  assert.equal(entries.broken, undefined);
  assert.equal(JSON.stringify(entries).includes("secret"), false);
  assert.deepEqual(entries.settings.value, {
    theme: "light",
    language: "en",
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
test("retired device exports and clearing remain scoped to the current account", () => {
  const records = new Map([
    ["quizverse:draft:alice:topic", JSON.stringify({ text: "Archived data" })],
    ["quizverse:draft:bob:topic", JSON.stringify({ text: "Other account" })],
  ]);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      get length() {
        return records.size;
      },
      key: (i: number) => [...records.keys()][i],
      getItem: (key: string) => records.get(key) ?? null,
      removeItem: (key: string) => records.delete(key),
    },
  });
  assert.equal(Object.keys(readRetiredDeviceData("alice")).length, 1);
  clearRetiredDeviceData("alice");
  assert.equal(records.has("quizverse:draft:alice:topic"), false);
  assert.equal(records.has("quizverse:draft:bob:topic"), true);
  assert.equal(isRetiredProgressKey("note:old-topic"), true);
  assert.equal(isRetiredProgressKey("result:current-quiz"), false);
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
