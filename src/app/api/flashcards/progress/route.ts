import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiFailure, ApiError, readBody, requestUser } from '@/lib/api';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFlashDecks } from '@/lib/content';
import { defaultStats, type FlashProgress, type Stats } from '@/lib/types';
import { nextStreak } from '@/lib/quiz-core.mjs';

const schema = z.object({ cardId: z.string().max(120), status: z.enum(['learned', 'difficult', 'new']) }).strict();
export async function POST(request: Request) {
  try {
    const { cardId, status } = schema.parse(await readBody(request));
    const user = (await requestUser(request, true))!;
    if (!(await getFlashDecks()).some(deck => deck.cards.some(card => card.id === cardId))) throw new ApiError('Flashcard not found.', 404);
    const ref = getFirebaseAdmin().db.doc(`users/${user.uid}/progress/flashcards`);
    const statsRef = getFirebaseAdmin().db.doc(`users/${user.uid}/stats/summary`);
    const progress = await getFirebaseAdmin().db.runTransaction(async transaction => {
      const [progressSnapshot, statsSnapshot] = await transaction.getAll(ref, statsRef);
      const current = progressSnapshot.data() as FlashProgress | undefined;
      const learned = new Set(current?.learned ?? []);
      const difficult = new Set(current?.difficult ?? []);
      learned.delete(cardId); difficult.delete(cardId);
      if (status === 'learned') learned.add(cardId);
      if (status === 'difficult') difficult.add(cardId);
      const next = { learned: [...learned], difficult: [...difficult] };
      transaction.set(ref, next);
      if (status !== 'new') {
        const stats: Stats = { ...defaultStats, ...statsSnapshot.data() };
        const today = new Date().toISOString().slice(0, 10);
        transaction.set(statsRef, { ...stats, streak: nextStreak(stats.lastActivity, stats.streak, today), lastActivity: today });
      }
      return next;
    });
    return NextResponse.json(progress);
  } catch (error) { return apiFailure(error); }
}
