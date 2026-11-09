import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { uniqueQuestions } from './quiz-core.mjs';
import type { Category, FlashDeck, PersonalitySummary } from './types';

export type Question = { id: string; type: 'mcq' | 'true-false' | 'fill-blanks'; question: string; question_ur?: string; choices: string[]; options?: { en: string[]; ur: string[] }; correctAnswer: string | number | boolean; correctAnswer_ur?: string; hint?: string; hint_ur?: string; explanation?: string; explanation_ur?: string; timeLimit?: number };
export type PersonalityQuiz = { id: string; title: string; title_ur?: string; description: string; description_ur?: string; questions: { question: string; question_ur?: string; options: { text: string; text_ur?: string; emoji?: string; points: Record<string, number> }[] }[]; results: Record<string, { title: string; title_ur?: string; description: string; description_ur?: string; emoji?: string }> };

export const getCatalog = cache(async () => {
  const directory = path.join(process.cwd(), 'data', 'questions');
  const categories: Category[] = [];
  const questions = new Map<string, Question[]>();
  for (const filename of (await readdir(directory)).filter(name => /^[a-z0-9_-]+\.json$/.test(name)).sort()) {
    const text = await readFile(path.join(directory, filename), 'utf8');
    if (!text.trim()) continue;
    const data = JSON.parse(text);
    if (!Array.isArray(data.questions)) continue;
    const usable = uniqueQuestions(data.questions, filename.slice(0, -5)) as Question[];
    if (!usable.length) continue;
    const id = filename.slice(0, -5);
    questions.set(id, usable);
    categories.push({ id, name: data.meta?.category ?? id.replaceAll('_', ' '), nameUr: data.meta?.category_ur ?? data.meta?.category ?? id, description: data.meta?.description ?? '', descriptionUr: data.meta?.description_ur ?? data.meta?.description ?? '', difficulty: data.meta?.difficulty ?? 'mixed', count: usable.length });
  }
  return { categories, questions };
});

export const getPersonalities = cache(async () => JSON.parse(await readFile(path.join(process.cwd(), 'data/personality-quiz-data.json'), 'utf8')) as Record<string, PersonalityQuiz>);
export async function getPersonalitySummaries(): Promise<PersonalitySummary[]> {
  return Object.entries(await getPersonalities()).filter(([, quiz]) => quiz.questions?.length && quiz.results).map(([id, quiz]) => ({ id, title: quiz.title, titleUr: quiz.title_ur ?? quiz.title, description: quiz.description, descriptionUr: quiz.description_ur ?? quiz.description, count: quiz.questions.length }));
}
export const getFlashDecks = cache(async (): Promise<FlashDeck[]> => {
  const data = JSON.parse(await readFile(path.join(process.cwd(), 'data/flashcards.json'), 'utf8'));
  return data.decks.map((deck: FlashDeck) => ({ ...deck, cards: deck.cards.map((card, index) => ({ ...card, id: `${deck.id}:${index}` })) }));
});
