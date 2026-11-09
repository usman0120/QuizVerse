import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { apiFailure } from '@/lib/api';

export async function GET() {
  try {
    const snapshot = await getFirebaseAdmin().db.collection('leaderboard').orderBy('xp', 'desc').limit(20).get();
    return NextResponse.json(snapshot.docs.map((doc, index) => ({ rank: index + 1, displayName: doc.data().displayName, xp: doc.data().xp, quizzes: doc.data().quizzes })), { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } });
  } catch (error) { return apiFailure(error); }
}
