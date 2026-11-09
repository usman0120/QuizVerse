'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useApp } from './app-provider';
import { authError } from './auth-form';

export function Account() {
  const { user, loading, profile, stats, history, updateProfile, request, signOut } = useApp();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function action(run: () => Promise<void>, success: string) {
    setBusy(true); setMessage(''); setError('');
    try { await run(); setMessage(success); } catch (error) { setError(authError(error)); } finally { setBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    await action(() => updateProfile({ displayName: String(data.get('displayName')).trim(), language: data.get('language') === 'ur' ? 'ur' : 'en', theme: data.get('theme') as 'system' | 'light' | 'dark', publicLeaderboard: data.get('publicLeaderboard') === 'on' }), 'Profile saved.');
  }
  async function deleteAccount() {
    if (!window.confirm('Permanently delete your account, history, progress, and leaderboard entry? This cannot be undone.')) return;
    await action(async () => { await request('/api/account', undefined, 'DELETE'); await signOut(); }, 'Account deleted.');
  }
  if (loading) return <div className="card center">Loading account…</div>;
  if (!user) return <section className="card narrow center"><h1 style={{ fontSize: '2rem' }}>Save your next chapter</h1><p>Sign in to view saved progress. Guest results are not stored or imported.</p><Link className="button" href="/auth">Sign in</Link></section>;
  const today = new Date().toISOString().slice(0, 10); const yesterday = new Date(); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const streak = [today, yesterday.toISOString().slice(0, 10)].includes(stats.lastActivity) ? stats.streak : 0;
  return <><p className="eyebrow">Your account</p><h1 style={{ fontSize: '2.7rem' }}>{profile.displayName}</h1><p className="muted">{user.email}</p>{error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert" role="status">{message}</div>}{!user.emailVerified && <div className="alert">Verify your email to participate in public rankings. <button className="text-button" disabled={busy} onClick={() => void action(() => sendEmailVerification(user), 'Verification email sent.')}>Resend verification</button> · <button className="text-button" disabled={busy} onClick={() => void action(async () => { await user.reload(); await user.getIdToken(true); }, 'Verification status refreshed.')}>I have verified my email</button></div>}<section className="grid four"><div className="card stat"><strong>{stats.quizzes}</strong><span>Completed quizzes</span></div><div className="card stat"><strong>{stats.xp}</strong><span>XP</span></div><div className="card stat"><strong>{streak}</strong><span>Day streak (UTC)</span></div><div className="card stat"><strong>{stats.total ? Math.round(stats.correct / stats.total * 100) : 0}%</strong><span>Knowledge accuracy</span></div></section><section className="section card"><h2>Profile and preferences</h2><form key={`${profile.displayName}:${profile.language}:${profile.theme}:${profile.publicLeaderboard}`} onSubmit={event => void save(event)}><div className="toolbar"><label>Display name<input name="displayName" minLength={2} maxLength={40} required defaultValue={profile.displayName} /></label><label>Language<select name="language" defaultValue={profile.language}><option value="en">English</option><option value="ur">اردو</option></select></label><label>Theme<select name="theme" defaultValue={profile.theme}><option value="system">System preference</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div><label className="check-label field"><input type="checkbox" name="publicLeaderboard" defaultChecked={profile.publicLeaderboard} />Show my display name and XP on the public leaderboard</label><p className="muted"><small>No age, gender, or country is required. Opting out removes your public entry. Saved XP remains private and can be shown if you opt in again.</small></p><button className="button" disabled={busy}>Save changes</button></form></section><section className="section card"><div className="section-heading"><h2>Recent quiz history</h2><span className="muted">Latest 50 quizzes</span></div>{history.length ? <div className="table-wrap"><table><thead><tr><th>Quiz</th><th>Result</th><th>XP</th><th>Date</th></tr></thead><tbody>{history.map(item => <tr key={item.id}><td>{item.title}</td><td>{item.personality?.title ?? `${item.correct}/${item.total}`}</td><td>{item.xp}</td><td>{new Date(item.completedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <p className="muted">No saved quizzes yet. <Link href="/quizzes">Take your first quiz.</Link></p>}</section><section className="section card"><h2>Account controls</h2><p className="muted">For account deletion, sign out and sign in again immediately before deleting. This helps protect your account.</p><div className="row"><button className="button secondary" disabled={busy} onClick={() => void action(signOut, 'Signed out.')}>Sign out</button><button className="button danger" disabled={busy} onClick={() => void deleteAccount()}>Delete account permanently</button></div></section></>;
}
