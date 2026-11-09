import { test } from "node:test";
import assert from "node:assert/strict";
import { deduplicateExact, exactKey } from "../scripts/audit-content.mjs";
test("source cleanup removes only complete matches except ID", () => {
  const q = {
    id: 1,
    question: "Question?",
    options: ["A", "B"],
    explanation: "Detail",
    correctAnswer: 0,
  };
  const result = deduplicateExact([
    q,
    { ...q, id: 2 },
    { ...q, id: 3, explanation: "Different detail" },
    { ...q, id: 4, correctAnswer: 1 },
  ]);
  assert.deepEqual(
    result.kept.map((q) => q.id),
    [1, 3, 4],
  );
  assert.equal(result.removed.length, 1);
  assert.equal(result.removed[0].retainedId, 1);
  assert.equal(
    exactKey(q),
    exactKey({
      correctAnswer: 0,
      explanation: "Detail",
      options: ["A", "B"],
      question: "Question?",
      id: 100,
    }),
  );
});
