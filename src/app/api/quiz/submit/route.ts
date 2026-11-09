import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { apiFailure, ApiError, readBody, requestUser } from '@/lib/api';
import { gradeSession } from '@/lib/quiz-server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { defaultProfile, defaultStats, type HistoryItem, type Profile, type Stats } from '@/lib/types';
import { nextStreak } from '@/lib/quiz-core.mjs';

const schema = z.object({ token: z.string().max(24000), answers: z.array(z.union([z.number().int().min(0).max(30), z.string().max(300), z.null()])).min(1).max(100) }).strict();
export async function POST(request: Request) {
  try {
    const input = schema.parse(await readBody(request));
    const user = await requestUser(request);
    const { payload, result } = await gradeSession(input.token, input.answers, user?.uid ?? null);
    if (!user) return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    const { db } = getFirebaseAdmin();
    const accountRef = db.doc(`users/${user.uid}`);
    const statsRef = accountRef.collection('stats').doc('summary');
    const historyRef = accountRef.collection('history').doc(result.id);
    const today = result.completedAt.slice(0, 10);
    const creditRef = accountRef.collection('credits').doc(`${today}_${payload.category}`);
    const answerHash = createHash('sha256').update(JSON.stringify(input.answers)).digest('hex');
    const saved = await db.runTransaction(async transaction => {
      const [previous, account, currentStats, credit] = await transaction.getAll(historyRef, accountRef, statsRef, creditRef);
      // Retries return the first result, never award points or increment streaks twice.
      if (previous.exists) {
        const { answerHash: previousHash, ...summary } = previous.data()!;
        if (previousHash !== answerHash) throw new ApiError('This quiz has already been submitted with different answers.', 409);
        return summary as HistoryItem;
      }
      const profile: Profile = { ...defaultProfile, ...account.data()?.profile };
      const stats: Stats = { ...defaultStats, ...currentStats.data() };
      const eligible = payload.kind === 'quiz' && !credit.exists;
      const xp = eligible ? result.correct * 10 : 0;
      const next: Stats = { quizzes: stats.quizzes + 1, correct: stats.correct + result.correct, total: stats.total + (payload.kind === 'quiz' ? result.total : 0), xp: stats.xp + xp, streak: nextStreak(stats.lastActivity, stats.streak, today), lastActivity: today };
      const { review: _review, ...summary } = result;
      void _review;
      const record = { ...summary, xp, ranked: eligible && profile.publicLeaderboard && user.email_verified === true, saved: true };
      transaction.set(historyRef, { ...record, answerHash });
      transaction.set(statsRef, next);
      if (eligible) transaction.set(creditRef, { completedAt: result.completedAt });
      if (profile.publicLeaderboard && user.email_verified === true) transaction.set(db.doc(`leaderboard/${user.uid}`), { displayName: profile.displayName, xp: next.xp, quizzes: next.quizzes, updatedAt: result.completedAt });
      return record;
    });
    return NextResponse.json({ ...result, ...saved }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
