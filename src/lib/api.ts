import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getFirebaseAdmin } from './firebase-admin';

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function readBody(request: Request) {
  // Bound actual bytes, not just a client-supplied Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError('A JSON body is required.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32000) { await reader.cancel(); throw new ApiError('Request is too large.', 413); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ApiError('Invalid JSON.'); }
}
export async function requestUser(request: Request, required = false) {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    if (required) throw new ApiError('Sign in to save your progress.', 401);
    return null;
  }
  if (!authorization.startsWith('Bearer ')) throw new ApiError('Invalid sign-in token.', 401);
  try { return await getFirebaseAdmin().auth.verifyIdToken(authorization.slice(7), true); }
  catch (error) {
    if (error instanceof Error && error.message.includes('not configured')) throw new ApiError(error.message, 503);
    throw new ApiError('Your session expired. Please sign in again.', 401);
  }
}
export function apiFailure(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: 'Invalid request. Check your entries.' }, { status: 400 });
  if (error instanceof Error && error.message.includes('not configured')) return NextResponse.json({ error: error.message }, { status: 503 });
  console.error('API request failed:', error instanceof Error ? error.message : 'Unknown error');
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
