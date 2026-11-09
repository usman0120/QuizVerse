'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Entry = { rank: number; displayName: string; xp: number; quizzes: number };
async function fetchEntries(signal?: AbortSignal): Promise<Entry[]> {
  const response = await fetch('/api/leaderboard', { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Could not load rankings.');
  return data;
}
export function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  async function load(signal?: AbortSignal) {
    try {
      setEntries(await fetchEntries(signal)); setError('');
    } catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : 'Could not load rankings.'); }
    finally { if (!signal?.aborted) setLoading(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetchEntries(controller.signal)
      .then(data => { if (!controller.signal.aborted) setEntries(data); })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not load rankings.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <><p className="eyebrow">A little friendly competition</p><h1>Curiosity earns its place.</h1><p className="muted">Real, server-graded XP. Public participation is optional and requires a verified email. Only the first completed knowledge quiz per category each UTC day earns XP; personality quizzes do not.</p><div className="row"><Link className="button" href="/quizzes">Take a quiz</Link><Link className="button secondary" href="/account">Manage participation</Link><button className="button secondary" disabled={loading} onClick={() => { setLoading(true); setError(''); void load(); }}>Refresh</button></div><section className="section card">{loading ? <p role="status">Loading rankings…</p> : error ? <div className="alert error" role="alert">{error}</div> : entries.length ? <div className="table-wrap"><table><thead><tr><th>Rank</th><th>Player</th><th>XP</th><th>Quizzes</th></tr></thead><tbody>{entries.map(entry => <tr key={entry.rank}><td>{entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}</td><td>{entry.displayName}</td><td>{entry.xp.toLocaleString()}</td><td>{entry.quizzes}</td></tr>)}</tbody></table></div> : <div className="center"><h2>A fresh leaderboard</h2><p className="muted">No public scores yet. Opt in from your account and take a quiz.</p></div>}</section><p className="muted"><small>Rankings show the top 20 participants. Cached rankings can take up to 90 seconds to refresh. Quiz content is not a high-stakes assessment; external answer lookups cannot be completely prevented.</small></p></>;
}
