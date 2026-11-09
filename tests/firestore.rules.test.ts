import { after, before, test } from "node:test";
import { readFile } from "node:fs/promises";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
let env: RulesTestEnvironment;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-quizverse",
    firestore: {
      rules: await readFile("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 18088,
    },
  });
});
after(async () => {
  await env?.cleanup();
});
test("private records are accessible only by their owner; stale writes are rejected", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  const bob = env.authenticatedContext("bob").firestore();
  const guest = env.unauthenticatedContext().firestore();
  await assertSucceeds(
    setDoc(doc(alice, "quizverse_users/alice/entries/note"), {
      value: "Private note",
      updatedAt: 100,
    }),
  );
  await assertSucceeds(
    getDoc(doc(alice, "quizverse_users/alice/entries/note")),
  );
  await assertFails(getDoc(doc(bob, "quizverse_users/alice/entries/note")));
  await assertFails(getDoc(doc(guest, "quizverse_users/alice/entries/note")));
  await assertFails(
    setDoc(doc(alice, "quizverse_users/alice/entries/note"), {
      value: "Stale",
      updatedAt: 99,
    }),
  );
  await assertSucceeds(
    setDoc(doc(alice, "quizverse_users/alice/entries/note"), {
      value: null,
      updatedAt: 101,
      deleted: true,
    }),
  );
});
test("public scores validate identity and bounded values; list queries must be bounded", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  const guest = env.unauthenticatedContext().firestore();
  const score = {
    uid: "alice",
    displayName: "Player",
    category: "general_knowledge",
    title: "General Knowledge",
    score: 8,
    total: 10,
    seconds: 30,
    date: "2026-11-09T12:00:00.000Z",
  };
  await assertSucceeds(setDoc(doc(alice, "quizverse_scores/good"), score));
  await assertSucceeds(
    getDocs(query(collection(guest, "quizverse_scores"), limit(100))),
  );
  await assertFails(getDocs(collection(guest, "quizverse_scores")));
  await assertFails(setDoc(doc(guest, "quizverse_scores/guest"), score));
  await assertFails(
    setDoc(doc(alice, "quizverse_scores/forged"), { ...score, uid: "bob" }),
  );
  await assertFails(
    setDoc(doc(alice, "quizverse_scores/invalid"), { ...score, score: 999 }),
  );
  await assertFails(
    updateDoc(doc(alice, "quizverse_scores/good"), { uid: "bob" }),
  );
  await assertFails(
    setDoc(doc(alice, "unrelated/secrets"), { anything: true }),
  );
});
