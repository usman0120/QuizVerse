import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { uniqueQuestions, personalityWinner } from '../src/lib/quiz-core.mjs';

test('every retained knowledge file parses and supplies valid playable questions', async () => {
  const files = (await readdir('data/questions')).filter(file => file.endsWith('.json'));
  assert.ok(files.length > 0);
  for (const file of files) {
    const data = JSON.parse(await readFile(`data/questions/${file}`, 'utf8'));
    assert.ok(Array.isArray(data.questions), file);
    const questions = uniqueQuestions(data.questions, file.slice(0, -5));
    assert.ok(questions.length > 0, `${file} needs playable questions`);
    assert.equal(new Set(questions.map(question => question.id)).size, questions.length, file);
    assert.equal(new Set(questions.map(question => question.question.trim().toLowerCase().replace(/\s+/g, ' '))).size, questions.length, file);
  }
});

test('all personality quizzes have coherent questions, scores, and results', async () => {
  const quizzes = JSON.parse(await readFile('data/personality-quiz-data.json', 'utf8'));
  for (const [id, quiz] of Object.entries(quizzes)) {
    assert.ok(quiz.title && quiz.description, id);
    assert.ok(quiz.questions.length > 0 && quiz.questions.length <= 100, id);
    assert.ok(Object.keys(quiz.results).length > 0, id);
    quiz.questions.forEach(question => {
      assert.ok(question.question && question.options.length >= 2, id);
      question.options.forEach(option => {
        assert.ok(option.text, id);
        Object.entries(option.points).forEach(([key, points]) => {
          assert.ok(key in quiz.results, `${id}: ${key} is not a result`);
          assert.ok(Number.isFinite(points), id);
        });
      });
    });
    assert.ok(quiz.results[personalityWinner(quiz, quiz.questions.map(() => 0))], id);
  }
});

test('flashcard deck IDs are unique and cards contain usable text', async () => {
  const { decks } = JSON.parse(await readFile('data/flashcards.json', 'utf8'));
  assert.equal(new Set(decks.map(deck => deck.id)).size, decks.length);
  decks.forEach(deck => {
    assert.ok(deck.title && deck.description && deck.cards.length, deck.id);
    deck.cards.forEach(card => {
      assert.equal(typeof card.front, 'string', deck.id);
      assert.equal(typeof card.back, 'string', deck.id);
      assert.ok(card.front.trim() && card.back.trim(), deck.id);
    });
  });
});
