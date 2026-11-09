import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateStreak,
  isCorrect,
  normalizeQuestions,
  personalityMatch,
  seededRandom,
  shuffle,
} from "../src/lib/quiz";
import type { PersonalityQuiz, Question } from "../src/lib/types";
test("MCQ and true/false keep answer identity across languages", () => {
  const question = { type: "mcq", correctAnswer: 0 } as Question;
  assert.equal(isCorrect(question, 0, "en"), true);
  assert.equal(isCorrect(question, 0, "ur"), true);
  assert.equal(
    isCorrect(
      { type: "true-false", correctAnswer: false } as Question,
      false,
      "en",
    ),
    true,
  );
});
test("fill blanks accept English or Urdu with normalized case and whitespace", () => {
  const question = {
    type: "fill-blanks",
    correctAnswer: "Islamabad",
    correctAnswer_ur: "اسلام آباد",
  } as Question;
  assert.equal(isCorrect(question, "  ISLAMABAD  ", "en"), true);
  assert.equal(isCorrect(question, "اسلام  آباد", "ur"), true);
  assert.equal(isCorrect(question, "Karachi", "ur"), false);
});
test("normalization removes duplicate text and out-of-bounds answers", () => {
  const q = {
    type: "mcq",
    question: "A question?",
    correctAnswer: 0,
    options: { en: ["Yes", "No"] },
    timeLimit: 30,
  };
  const result = normalizeQuestions(
    [q, { ...q, id: 999 }, { ...q, question: "Bad?", correctAnswer: 4 }],
    "test",
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "test:0");
});
test("daily shuffle is deterministic and does not mutate the question bank", () => {
  const input = Array.from({ length: 100 }, (_, i) => i);
  const before = [...input];
  assert.deepEqual(
    shuffle(input, seededRandom("2026-11-09")),
    shuffle(input, seededRandom("2026-11-09")),
  );
  assert.notDeepEqual(
    shuffle(input, seededRandom("2026-11-09")),
    shuffle(input, seededRandom("2026-11-10")),
  );
  assert.deepEqual(input, before);
});
test("personality scores are recalculated after changing a previous answer", () => {
  const quiz = {
    results: { a: {}, b: {} },
    questions: [
      { options: [{ points: { a: 3, b: 0 } }, { points: { a: 0, b: 3 } }] },
      { options: [{ points: { a: 2, b: 1 } }] },
    ],
  } as unknown as PersonalityQuiz;
  assert.equal(personalityMatch(quiz, [0, 0]), "a");
  assert.equal(personalityMatch(quiz, [1, 0]), "b");
  assert.equal(personalityMatch(quiz, [1, 0]), "b");
});
test("explicit one-based banks are converted without guessing other banks", () => {
  const raw = {
    type: "mcq",
    question: "Which civilization built Giza?",
    correctAnswer: 2,
    options: { en: ["Mesopotamians", "Egyptians", "Romans", "Greeks"] },
  };
  assert.equal(normalizeQuestions([raw], "history", 1)[0].correctAnswer, 1);
  assert.equal(normalizeQuestions([raw], "other", 0)[0].correctAnswer, 2);
  assert.equal(raw.correctAnswer, 2);
});
test("streak handles yesterday, gaps, and month boundaries", () => {
  assert.equal(
    calculateStreak(["2026-11-09", "2026-11-08", "2026-11-08"], "2026-11-09"),
    2,
  );
  assert.equal(calculateStreak(["2026-11-08", "2026-11-07"], "2026-11-09"), 2);
  assert.equal(calculateStreak(["2026-11-06"], "2026-11-09"), 0);
  assert.equal(calculateStreak(["2026-11-01", "2026-10-31"], "2026-11-01"), 2);
});
