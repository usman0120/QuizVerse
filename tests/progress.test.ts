import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeEntries, migrateLegacy, storageKey } from "../src/lib/progress";
test("sync merges different records without overwriting unrelated progress", () => {
  const merged = mergeEntries(
    { note: { value: "local", updatedAt: 2 } },
    { quiz: { value: 10, updatedAt: 3 }, note: { value: "old", updatedAt: 1 } },
  );
  assert.equal(merged.note.value, "local");
  assert.equal(merged.quiz.value, 10);
});
test("new deletion marker wins over stale remote note", () => {
  const result = mergeEntries(
    { note: { value: null, updatedAt: 3, deleted: true } },
    { note: { value: "old", updatedAt: 2 } },
  );
  assert.equal(result.note.deleted, true);
  assert.equal(result.note.value, null);
});
test("guest and different account caches are isolated", () => {
  assert.notEqual(storageKey(), storageKey("alice"));
  assert.notEqual(storageKey("alice"), storageKey("bob"));
});
test("remote snapshot wins equal timestamp collisions", () => {
  const merged = mergeEntries(
    { note: { value: "local", updatedAt: 5 } },
    { note: { value: "server winner", updatedAt: 5 } },
  );
  assert.equal(merged.note.value, "server winner");
});
test("legacy migration strips plaintext passwords and recognizes notes/bookmarks/history", () => {
  const storage = new Map<string, string>([
    [
      "quizverse_profile",
      JSON.stringify({
        name: "Learner",
        password: "DO_NOT_KEEP",
        country: "PK",
        age: "20",
      }),
    ],
    ["userNotes", JSON.stringify({ "science-nature-intro": "My note" })],
    [
      "bookmarks",
      JSON.stringify([
        {
          categoryId: "science-nature",
          sectionId: "intro",
          sectionName: { en: "Introduction" },
        },
      ]),
    ],
    [
      "quizHistory",
      JSON.stringify([
        { quiz: "Test", result: "Match", date: "2026-11-09T00:00:00.000Z" },
      ]),
    ],
  ]);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { matchMedia: () => ({ matches: false }) },
  });
  const entries = migrateLegacy();
  assert.equal(JSON.stringify(entries).includes("DO_NOT_KEEP"), false);
  assert.equal(
    JSON.parse(storage.get("quizverse_profile")!).password,
    undefined,
  );
  assert.equal(
    (entries["note:science-nature:intro"].value as { text: string }).text,
    "My note",
  );
  assert.ok(entries["bookmark:science-nature:intro"]);
  assert.ok(entries["personality:legacy-0"]);
  storage.set(storageKey(), "{}");
  assert.deepEqual(migrateLegacy(), {});
});
