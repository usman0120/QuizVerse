import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiFailure, readBody, requestUser } from '@/lib/api';
import { startSession } from '@/lib/quiz-server';

const schema = z.object({ category: z.string().regex(/^[a-z0-9_-]{1,80}$/), kind: z.enum(['quiz', 'personality']).default('quiz'), count: z.union([z.literal(5), z.literal(10), z.literal(20)]).default(10), language: z.enum(['en', 'ur']).default('en'), timed: z.boolean().default(false) }).strict();
export async function POST(request: Request) {
  try {
    const input = schema.parse(await readBody(request));
    const user = await requestUser(request);
    return NextResponse.json(await startSession(input, user?.uid ?? null), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
