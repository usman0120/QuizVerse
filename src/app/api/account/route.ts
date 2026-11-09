import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiFailure, ApiError, readBody, requestUser } from '@/lib/api';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { defaultProfile, type Profile } from '@/lib/types';

const schema = z.object({ displayName: z.string().trim().min(2).max(40).optional(), language: z.enum(['en', 'ur']).optional(), theme: z.enum(['system', 'light', 'dark']).optional(), publicLeaderboard: z.boolean().optional() }).strict();
export async function PATCH(request: Request) {
  try {
    const updates = schema.parse(await readBody(request));
    const user = (await requestUser(request, true))!;
    const { db } = getFirebaseAdmin();
    const ref = db.doc(`users/${user.uid}`);
    const profile = await db.runTransaction(async transaction => {
      const [account, stats] = await transaction.getAll(ref, ref.collection('stats').doc('summary'));
      const profile: Profile = { ...defaultProfile, displayName: user.name?.slice(0, 40) || defaultProfile.displayName, ...account.data()?.profile, ...updates };
      transaction.set(ref, { profile, updatedAt: new Date().toISOString() }, { merge: true });
      const leaderboard = db.doc(`leaderboard/${user.uid}`);
      if (!profile.publicLeaderboard || !user.email_verified) transaction.delete(leaderboard);
      else if (stats.exists) transaction.set(leaderboard, { displayName: profile.displayName, xp: stats.data()!.xp, quizzes: stats.data()!.quizzes, updatedAt: new Date().toISOString() });
      return profile;
    });
    return NextResponse.json(profile);
  } catch (error) { return apiFailure(error); }
}
export async function DELETE(request: Request) {
  try {
    const user = (await requestUser(request, true))!;
    if (Date.now() / 1000 - user.auth_time > 300) throw new ApiError('Sign out and sign in again before deleting your account.', 401);
    const { db, auth } = getFirebaseAdmin();
    await db.doc(`leaderboard/${user.uid}`).delete();
    await db.recursiveDelete(db.doc(`users/${user.uid}`));
    await auth.deleteUser(user.uid);
    return NextResponse.json({ deleted: true });
  } catch (error) { return apiFailure(error); }
}
