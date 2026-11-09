import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { normalizeQuestions, personalityMatch } from "../src/lib/quiz";
import type { PersonalityQuiz } from "../src/lib/types";
import { quotes } from "../src/lib/quotes";
test("all nonempty quiz banks parse and have playable, unique questions", async () => {
  let banks = 0;
  for (const file of await readdir("data/questions")) {
    const text = (await readFile(`data/questions/${file}`, "utf8")).trim();
    if (!text) continue;
    const data = JSON.parse(text);
    const questions = normalizeQuestions(
      data.questions,
      file,
      data.meta?.answerIndexBase === 1 ? 1 : 0,
    );
    assert.ok(questions.length, `${file} has no playable questions`);
    assert.equal(
      new Set(
        questions.map((q) => `${q.type}:${q.question.toLowerCase().trim()}`),
      ).size,
      questions.length,
    );
    assert.ok(questions.every((q) => q.timeLimit >= 5 && q.timeLimit <= 120));
    banks++;
  }
  assert.equal(banks, 27);
});
test("all 23 personality quizzes have valid scoring targets and nonempty results", async () => {
  const quizzes = Object.values(
    JSON.parse(await readFile("data/personality-quiz-data.json", "utf8")),
  ) as PersonalityQuiz[];
  assert.equal(quizzes.length, 23);
  for (const quiz of quizzes) {
    assert.ok(quiz.questions.length);
    assert.ok(Object.keys(quiz.results).length);
    for (const q of quiz.questions)
      for (const option of q.options)
        for (const key of Object.keys(option.points))
          assert.ok(key in quiz.results, `${quiz.id}: unknown result ${key}`);
    assert.ok(
      personalityMatch(
        quiz,
        quiz.questions.map(() => 0),
      ) in quiz.results,
    );
  }
});
test("all original quotes are retained", () => {
  assert.equal(quotes.length, 100);
});
