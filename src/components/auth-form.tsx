'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase-client';
import { useApp } from './app-provider';

const authMessages: Record<string, string> = {
  'auth/invalid-credential': 'Email or password is incorrect.', 'auth/email-already-in-use': 'An account already exists with this email. Try signing in or resetting your password.',
  'auth/weak-password': 'Choose a stronger password (at least 8 characters).', 'auth/invalid-email': 'Enter a valid email address.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.', 'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/unauthorized-domain': 'This domain is not authorized in Firebase Authentication settings.', 'auth/operation-not-allowed': 'Enable this sign-in provider in the Firebase console.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.', 'auth/network-request-failed': 'Check your internet connection and try again.',
  'auth/account-exists-with-different-credential': 'This email uses a different sign-in method. Sign in with your original method first.',
};
export function authError(error: unknown) { return typeof error === 'object' && error && 'code' in error ? authMessages[String(error.code)] ?? 'Sign-in failed. Please try again.' : error instanceof Error ? error.message : 'Sign-in failed.'; }
export function AuthForm() {
  const { user, loading, configured } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); const client = getFirebaseClient(); if (!client) return;
    setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'reset') { await sendPasswordResetEmail(client.auth, email.trim()); setMessage('If an account exists for this address, a password-reset email will arrive shortly.'); }
      else if (mode === 'register') {
        const credential = await createUserWithEmailAndPassword(client.auth, email.trim(), password);
        try { await sendEmailVerification(credential.user); setMessage('Account created. Check your inbox to verify your email.'); }
        catch { setMessage('Account created, but the verification email could not be sent. Resend it from your account page.'); }
      } else await signInWithEmailAndPassword(client.auth, email.trim(), password);
    } catch (error) { setError(authError(error)); }
    finally { setBusy(false); }
  }
  async function google() {
    const client = getFirebaseClient(); if (!client) return; setBusy(true); setError('');
    try { await signInWithPopup(client.auth, new GoogleAuthProvider()); }
    catch (error) { setError(authError(error)); } finally { setBusy(false); }
  }
  if (loading) return <div className="card narrow center">Checking your account…</div>;
  if (user) return <section className="card narrow center"><h1 style={{ fontSize: '2rem' }}>You’re signed in</h1>{message && <div className="alert" role="status">{message}</div>}<p className="muted">Continue to your account or pick a quiz.</p><div className="row"><Link href="/account" className="button">Your account</Link><Link href="/quizzes" className="button secondary">Explore quizzes</Link></div></section>;
  return <section className="card narrow"><p className="eyebrow">Your QuizVerse account</p><h1 style={{ fontSize: '2rem' }}>{mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Start your journey' : 'Reset your password'}</h1><p className="muted">Save your progress and pick up on any device.</p>{!configured && <div className="alert">Account services are not connected yet. Configure Firebase using <code>docs/firebase-setup.md</code>. <Link href="/quizzes">Guest quizzes are available.</Link></div>}{error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert" role="status">{message}</div>}{mode !== 'reset' && <><button className="button secondary full" disabled={!configured || busy} onClick={() => void google()}>Continue with Google</button><p className="center muted" style={{ marginBlock: 20 }}>or use your email</p></>}<form onSubmit={event => void submit(event)}><label className="field">Email<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label>{mode !== 'reset' && <label className="field">Password<input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 8 : 1} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} /></label>}<button className="button full" disabled={!configured || busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset email'}</button></form><div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}><button className="text-button" disabled={busy} onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); setMessage(''); }}>{mode === 'register' ? 'Already have an account?' : 'Create an account'}</button><button className="text-button" disabled={busy} onClick={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setError(''); setMessage(''); }}>{mode === 'reset' ? 'Back to sign-in' : 'Forgot password?'}</button></div><p className="muted"><small>By creating an account you agree to the <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link>.</small></p><Link href="/quizzes">Continue without an account →</Link></section>;
}
