import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyQuestions, normalizeQuestion, uniqueQuestions, shuffle, signSession, verifySession, gradeAnswer, nextStreak, personalityWinner } from '../src/lib/quiz-core.mjs';

const mcq = { type: 'mcq', question: 'Capital of France?', options: { en: ['Paris', 'Rome'], ur: ['پیرس', 'روم'] }, correctAnswer: 0 };
test('content validation rejects bad indexes and missing choices without guessing', () => {
  assert.equal(normalizeQuestion({ ...mcq, correctAnswer: 2 }, 0), null);
  assert.equal(normalizeQuestion({ ...mcq, correctAnswer: -1 }, 0), null);
  assert.equal(normalizeQuestion({ ...mcq, correctAnswer: '0' }, 0), null);
  assert.equal(normalizeQuestion({ ...mcq, options: [] }, 0), null);
  assert.equal(normalizeQuestion({ ...mcq, options: ['Paris', ''] }, 0), null);
  assert.equal(normalizeQuestion({ question: '', type: 'mcq' }, 0), null);
});
test('normalizes legacy question types and maintains source-index identities', () => {
  assert.equal(normalizeQuestion({ question: 'Gold symbol?', type: 'fill-in-the-blank', correctAnswer: 'Au' }, 2).type, 'fill-blanks');
  assert.equal(normalizeQuestion(mcq, 9).id, '9');
});
test('deduplicates prompts per category without modifying the source', () => {
  const source = [mcq, { ...mcq, question: ' capital OF France? ' }];
  assert.equal(uniqueQuestions(source).length, 1);
  assert.equal(source.length, 2);
});
test('withholds History MCQs until mixed answer-index conventions are reviewed', () => {
  assert.equal(uniqueQuestions([mcq], 'history').length, 0);
  assert.equal(uniqueQuestions([mcq], 'general_knowledge').length, 1);
  assert.equal(uniqueQuestions([{ type: 'true-false', question: 'Test?', correctAnswer: false }], 'history').length, 1);
});
test('option shuffling grades original answer indexes, not display positions', () => {
  const question = normalizeQuestion(mcq, 0);
  assert.equal(gradeAnswer(question, 1, [1, 0]), true);
  assert.equal(gradeAnswer(question, 0, [1, 0]), false);
  assert.equal(gradeAnswer(question, null, [1, 0]), false);
  assert.equal(gradeAnswer(question, '1', [1, 0]), false);
});
test('true/false honors shuffled choices and requires actual booleans in content', () => {
  const question = normalizeQuestion({ type: 'true-false', question: 'Test?', correctAnswer: false }, 0);
  assert.equal(gradeAnswer(question, 0, [1, 0]), true);
  assert.equal(gradeAnswer(question, 1, [1, 0]), false);
  assert.equal(normalizeQuestion({ ...question, correctAnswer: 'false' }, 0), null);
});
test('text answers normalize case, whitespace, and Unicode; accept Urdu alternatives only in Urdu', () => {
  const question = normalizeQuestion({ type: 'fill-blanks', question: 'Gold?', correctAnswer: 'Au', correctAnswer_ur: 'سونا' }, 0);
  assert.equal(gradeAnswer(question, '  aU  ', []), true);
  assert.equal(gradeAnswer(question, 'سونا', [], 'ur'), true);
  assert.equal(gradeAnswer(question, 'سونا', [], 'en'), false);
  assert.equal(gradeAnswer(question, null, []), false);
});
test('sessions reject tampering, wrong secrets, oversized input, and expiration', () => {
  const secret = 'a'.repeat(64);
  const payload = { id: 'one', expiresAt: 2000 };
  const token = signSession(payload, secret);
  assert.deepEqual(verifySession(token, secret, 1000), payload);
  assert.throws(() => verifySession(token, 'b'.repeat(64), 1000));
  assert.throws(() => verifySession(`x${token}`, secret, 1000));
  assert.throws(() => verifySession(`${token}.extra`, secret, 1000));
  assert.throws(() => verifySession(token, secret, 2000), /expired/);
  assert.throws(() => verifySession('a'.repeat(24001), secret, 1000));
});
test('shuffle preserves entries and does not mutate the input', () => {
  const source = [1, 2, 3, 4, 5];
  assert.deepEqual(shuffle(source).sort(), source);
  assert.deepEqual(source, [1, 2, 3, 4, 5]);
});
test('daily questions are stable by UTC date and avoid cross-category repeats', () => {
  const source = [
    { id: 'a:0', question: 'Question one' }, { id: 'b:0', question: 'Question one' },
    { id: 'a:1', question: 'Question two' }, { id: 'a:2', question: 'Question three' },
  ];
  const first = dailyQuestions(source, '2026-11-09', 3);
  assert.deepEqual(first, dailyQuestions([...source].reverse(), '2026-11-09', 3));
  assert.equal(new Set(first.map(question => question.question)).size, 3);
  assert.equal(source.length, 4);
});
test('UTC streak calculation handles retries, gaps, month and year transitions', () => {
  assert.equal(nextStreak('2026-11-09', 3, '2026-11-09'), 3);
  assert.equal(nextStreak('2026-11-08', 3, '2026-11-09'), 4);
  assert.equal(nextStreak('2026-11-07', 3, '2026-11-09'), 1);
  assert.equal(nextStreak('2025-12-31', 3, '2026-01-01'), 4);
  assert.equal(nextStreak('', 0, '2026-11-09'), 1);
});
test('personality result uses real points with stable ties, rejects missing answers', () => {
  const quiz = { results: { A: {}, B: {} }, questions: [{ options: [{ points: { A: 1, B: 3 } }, { points: { A: 2, B: 2 } }] }] };
  assert.equal(personalityWinner(quiz, [0]), 'B');
  assert.equal(personalityWinner(quiz, [1]), 'A');
  assert.throws(() => personalityWinner(quiz, [null]));
});
