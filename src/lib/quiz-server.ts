import 'server-only';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { getCatalog, getPersonalities, type Question } from './content';
import { dailyQuestions, gradeAnswer, personalityWinner, shuffle, signSession, verifySession } from './quiz-core.mjs';
import type { Language, PublicQuestion, QuizResult } from './types';
import { ApiError } from './api';

type Payload = { id: string; kind: 'quiz' | 'personality'; category: string; language: Language; uid: string | null; issuedAt: number; expiresAt: number; timed: boolean; contentHash?: string; entries: { id: string; order: number[]; contentHash?: string }[] };
const contentHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const developmentSecret = randomBytes(32).toString('hex');
function secret() {
  const value = process.env.QUIZ_SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === 'production') throw new ApiError('Quiz sessions are not configured. Set QUIZ_SESSION_SECRET on the server.', 503);
  // Share a fallback across separately compiled development route modules.
  process.env.QUIZ_SESSION_SECRET = developmentSecret;
  return developmentSecret;
}
function choices(question: Question, language: Language) {
  if (question.type === 'true-false') return language === 'ur' ? ['درست', 'غلط'] : ['True', 'False'];
  return language === 'ur' && question.options?.ur?.length === question.choices.length ? question.options.ur : question.choices;
}
export async function startSession(input: { category: string; kind: 'quiz' | 'personality'; count: number; language: Language; timed: boolean }, uid: string | null) {
  const issuedAt = Date.now();
  const payload: Payload = { id: randomUUID(), ...input, uid, issuedAt, expiresAt: issuedAt + 60 * 60 * 1000, entries: [] };
  let title: string;
  let questions: PublicQuestion[];
  if (input.kind === 'personality') {
    const quiz = (await getPersonalities())[input.category];
    if (!quiz) throw new ApiError('Personality quiz not found.', 404);
    payload.timed = false;
    payload.contentHash = contentHash(quiz);
    title = input.language === 'ur' ? quiz.title_ur ?? quiz.title : quiz.title;
    questions = quiz.questions.map((question, index) => {
      const order = question.options.map((_, optionIndex) => optionIndex);
      payload.entries.push({ id: String(index), order });
      return { id: String(index), type: 'mcq', text: input.language === 'ur' ? question.question_ur ?? question.question : question.question, options: question.options.map(option => `${option.emoji ?? ''} ${input.language === 'ur' ? option.text_ur ?? option.text : option.text}`.trim()), hint: '', timeLimit: 30 };
    });
  } else {
    const catalog = await getCatalog();
    const daily = input.category === 'daily';
    const pool = daily ? [...catalog.questions.values()].flat() : catalog.questions.get(input.category);
    if (!pool?.length) throw new ApiError('This category has no available questions.', 404);
    title = daily ? (input.language === 'ur' ? 'روزانہ چیلنج' : 'Daily challenge') : (input.language === 'ur' ? catalog.categories.find(category => category.id === input.category)!.nameUr : catalog.categories.find(category => category.id === input.category)!.name);
    // Daily selection is stable for everyone on the same UTC date, with cross-category IDs.
    const available = daily ? [...catalog.questions.entries()].flatMap(([category, values]) => values.map(question => ({ ...question, id: `${category}:${question.id}` }))) : pool;
    const selection: Question[] = daily ? dailyQuestions(available, new Date().toISOString().slice(0, 10)) : shuffle(available).slice(0, input.count);
    questions = selection.map(question => {
      const options = choices(question, input.language);
      const order = shuffle(options.map((_, index) => index));
      payload.entries.push({ id: question.id, order, contentHash: contentHash({ ...question, id: question.id.split(':').at(-1) }) });
      return { id: question.id, type: question.type, text: input.language === 'ur' ? question.question_ur ?? question.question : question.question, options: order.map(index => options[index]), hint: input.language === 'ur' ? question.hint_ur ?? question.hint ?? '' : question.hint ?? '', timeLimit: Math.min(120, Math.max(10, question.timeLimit ?? 30)) };
    });
  }
  return { token: signSession(payload, secret()), title, questions, timed: payload.timed, language: input.language };
}
export async function gradeSession(token: string, answers: (number | string | null)[], uid: string | null): Promise<{ payload: Payload; result: QuizResult }> {
  let payload: Payload;
  try { payload = verifySession(token, secret()) as Payload; }
  catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(error instanceof Error ? error.message : 'Invalid quiz session.'); }
  if (payload.uid !== uid) throw new ApiError('Your sign-in changed during the quiz. Please start again.', 409);
  if (answers.length !== payload.entries.length) throw new ApiError('Incorrect number of answers.');
  const base: QuizResult = { id: payload.id, kind: payload.kind, title: '', correct: 0, total: answers.length, percentage: 0, xp: 0, ranked: false, completedAt: new Date().toISOString(), review: [], saved: false };
  if (payload.kind === 'personality') {
    const quiz = (await getPersonalities())[payload.category];
    if (quiz && payload.contentHash !== contentHash(quiz)) throw new ApiError('Quiz content changed. Please start again.', 409);
    if (!quiz || answers.some((answer, index) => !Number.isInteger(answer) || Number(answer) < 0 || Number(answer) >= quiz.questions[index].options.length)) throw new ApiError('Answer every personality question.');
    const winner = quiz.results[personalityWinner(quiz, answers)];
    base.title = payload.language === 'ur' ? quiz.title_ur ?? quiz.title : quiz.title;
    base.personality = { title: payload.language === 'ur' ? winner.title_ur ?? winner.title : winner.title, description: payload.language === 'ur' ? winner.description_ur ?? winner.description : winner.description, emoji: winner.emoji ?? '✨' };
  } else {
    const catalog = await getCatalog();
    base.title = payload.category === 'daily' ? 'Daily challenge' : catalog.categories.find(category => category.id === payload.category)?.name ?? 'Quiz';
    base.review = payload.entries.map((entry, index) => {
      const [category, id] = payload.category === 'daily' ? entry.id.split(':') : [payload.category, entry.id];
      const question = catalog.questions.get(category)?.find(value => value.id === id);
      if (!question || entry.contentHash !== contentHash(question)) throw new ApiError('Quiz content changed. Please start again.', 409);
      const options = choices(question, payload.language);
      const correctIndex = question.type === 'true-false' ? (question.correctAnswer ? 0 : 1) : Number(question.correctAnswer);
      const answer = question.type === 'fill-blanks' ? String(payload.language === 'ur' ? question.correctAnswer_ur ?? question.correctAnswer : question.correctAnswer) : options[correctIndex];
      const submitted = answers[index];
      return { text: payload.language === 'ur' ? question.question_ur ?? question.question : question.question, answer, submitted: typeof submitted === 'number' ? options[entry.order[submitted]] ?? 'Skipped' : submitted ?? 'Skipped', correct: gradeAnswer(question, submitted, entry.order, payload.language), explanation: payload.language === 'ur' ? question.explanation_ur ?? question.explanation ?? '' : question.explanation ?? '' };
    });
    base.correct = base.review.filter(item => item.correct).length;
    base.percentage = Math.round(base.correct / base.total * 100);
  }
  return { payload, result: base };
}
