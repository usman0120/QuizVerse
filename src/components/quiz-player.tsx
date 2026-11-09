'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from './app-provider';
import type { QuizResult, QuizSession } from '@/lib/types';

type Answer = number | string | null;
export function QuizPlayer({ category, kind, title }: { category: string; kind: 'quiz' | 'personality'; title: string }) {
  const { user, loading, profile, request } = useApp();
  const [count, setCount] = useState(10); const [timed, setTimed] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'submitting' | 'result'>('setup');
  const [starting, setStarting] = useState(false); const [session, setSession] = useState<QuizSession | null>(null);
  const [index, setIndex] = useState(0); const [answers, setAnswers] = useState<Answer[]>([]); const [selected, setSelected] = useState<Answer>(null);
  const [remaining, setRemaining] = useState(30); const [result, setResult] = useState<QuizResult | null>(null); const [error, setError] = useState('');
  const [sharing, setSharing] = useState(''); const [retrying, setRetrying] = useState(false);
  const lock = useRef(false); const deadline = useRef(0);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const current = session?.questions[index];
  const language = session?.language ?? profile.language;
  const ur = language === 'ur';

  async function start() {
    setStarting(true); setError('');
    try {
      const quiz = await request<QuizSession>('/api/quiz/start', { category, kind, count, language: profile.language, timed });
      setSession(quiz); setIndex(0); setAnswers([]); setSelected(null); setResult(null); setSharing('');
      deadline.current = Date.now() + quiz.questions[0].timeLimit * 1000;
      setRemaining(quiz.questions[0].timeLimit); lock.current = false; setPhase('playing');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not start quiz.'); }
    finally { setStarting(false); }
  }
  const submit = useCallback(async (completed: Answer[]) => {
    if (!session) return;
    setPhase('submitting'); setError(''); setRetrying(true);
    try { setResult(await request<QuizResult>('/api/quiz/submit', { token: session.token, answers: completed })); setPhase('result'); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not submit. Your answers are still available for retry.'); }
    finally { setRetrying(false); lock.current = false; }
  }, [session, request]);
  const advance = useCallback((answer: Answer) => {
    if (!session || phase !== 'playing' || lock.current) return;
    lock.current = true;
    const completed = [...answers, answer];
    setAnswers(completed); setSelected(null);
    if (index + 1 === session.questions.length) { void submit(completed); }
    else {
      deadline.current = Date.now() + session.questions[index + 1].timeLimit * 1000;
      setRemaining(session.questions[index + 1].timeLimit); setIndex(index + 1);
    }
  }, [session, phase, answers, index, submit]);
  useEffect(() => { lock.current = false; questionHeading.current?.focus(); }, [index, phase]);
  useEffect(() => {
    if (phase !== 'playing' || !session?.timed) return;
    const interval = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) advance(selected);
    }, 250);
    return () => window.clearInterval(interval);
  }, [phase, session, advance, selected]);
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'submitting') return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [phase]);
  async function share() {
    if (!result) return;
    const text = result.personality ? `${result.personality.title} — ${result.title} on QuizVerse` : `I scored ${result.correct}/${result.total} in ${result.title} on QuizVerse!`;
    const url = `${window.location.origin}/quiz?cat=${encodeURIComponent(category)}${kind === 'personality' ? '&kind=personality' : ''}`;
    try {
      if (navigator.share) await navigator.share({ title: 'QuizVerse', text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setSharing('Copied to clipboard.'); }
    } catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) setSharing('Sharing is unavailable in this browser.'); }
  }
  function reset() { setPhase('setup'); setSession(null); setAnswers([]); setResult(null); setError(''); lock.current = false; }

  return <div className="player" lang={language} dir={ur ? 'rtl' : 'ltr'}>
    <Link href={kind === 'personality' ? '/personality' : '/quizzes'}>← {ur ? 'تمام کوئز' : 'All quizzes'}</Link>
    {phase === 'setup' && <section className="card section"><p className="eyebrow">{kind === 'personality' ? 'Just for fun' : 'Your next challenge'}</p><h1>{title}</h1><p className="muted">{kind === 'personality' ? 'Choose the answers that feel most like you. There are no right or wrong answers.' : 'Choose your pace. Answers and explanations appear after you finish.'}</p>{!user && <div className="alert">Guest play is free. Results disappear when you leave. <Link href="/auth">Sign in before starting</Link> to save progress.</div>}{kind === 'quiz' && <><div className="field"><label>Questions<select value={category === 'daily' ? 5 : count} disabled={category === 'daily'} onChange={event => setCount(Number(event.target.value))}><option value={5}>5 questions</option><option value={10}>10 questions</option><option value={20}>20 questions</option></select></label></div><label className="check-label field"><input type="checkbox" checked={timed} onChange={event => setTimed(event.target.checked)} />Timed practice (unanswered questions are skipped)</label><p className="muted"><small>Only the first completed knowledge quiz per category per UTC day earns XP. Replays are practice. Timers are a practice aid, not anti-cheat protection.</small></p></>}{error && <div className="alert error" role="alert">{error}</div>}<button className="button full" disabled={loading || starting} onClick={() => void start()}>{starting ? 'Loading questions…' : loading ? 'Checking sign-in…' : ur ? 'کوئز شروع کریں' : 'Start quiz'} →</button></section>}
    {phase === 'playing' && current && session && (
      <section className="card section">
        <div className="player-header">
          <span className="badge">{index + 1} / {session.questions.length}</span>
          <strong>{session.title}</strong>
          {session.timed && <span aria-label={`${remaining} seconds remaining`}>⏱ {remaining}s</span>}
        </div>
        <div className="progress-track" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={session.questions.length} aria-valuenow={index}>
          <span style={{ width: `${index / session.questions.length * 100}%` }} />
        </div>
        <h2 ref={questionHeading} className="question-text" tabIndex={-1}>{current.text}</h2>
        {current.type === 'fill-blanks' ? (
          <div className="field">
            <label>Your answer
              <input autoComplete="off" maxLength={300} value={typeof selected === 'string' ? selected : ''}
                onChange={event => setSelected(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter' && typeof selected === 'string' && selected.trim()) advance(selected); }} />
            </label>
          </div>
        ) : (
          <div className="answers" role="group" aria-label="Answer choices">
            {current.options.map((option, optionIndex) => (
              <button key={`${current.id}:${optionIndex}`} className="answer" aria-pressed={selected === optionIndex} onClick={() => setSelected(optionIndex)}>
                <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
              </button>
            ))}
          </div>
        )}
        {current.hint && <details><summary>Need a hint?</summary><p className="muted">{current.hint}</p></details>}
        <div className="row section">
          <button className="button" disabled={selected === null || (typeof selected === 'string' && !selected.trim())} onClick={() => advance(selected)}>
            {index + 1 === session.questions.length ? 'Finish quiz' : 'Next question'} →
          </button>
          {kind !== 'personality' && <button className="button secondary" onClick={() => advance(null)}>Skip</button>}
          <button className="text-button" onClick={() => { if (window.confirm('Leave this quiz? Your current answers will be discarded.')) reset(); }}>End quiz</button>
        </div>
      </section>
    )}
    {phase === 'submitting' && <section className="card section center"><h2>{error ? 'Submission needs attention' : 'Checking your answers…'}</h2><p className="muted">{error ? 'Your answers remain in this tab. Retry after resolving the problem, or start a new quiz.' : 'Please keep this tab open.'}</p>{error && <><div className="alert error" role="alert">{error}</div><div className="row"><button className="button" disabled={retrying} onClick={() => void submit(answers)}>Retry submission</button><button className="button secondary" disabled={retrying} onClick={reset}>Start again</button></div></>}</section>}
    {phase === 'result' && result && <><section className="card section center"><p className="eyebrow">Quiz complete</p>{result.personality ? <><div className="result-score" aria-hidden="true">{result.personality.emoji}</div><h1>{result.personality.title}</h1><p>{result.personality.description}</p><small>For entertainment only. No scientifically measured accuracy or rarity is claimed.</small></> : <><h1>{result.percentage >= 80 ? 'Great work!' : result.percentage >= 50 ? 'Nicely done!' : 'Keep your curiosity going!'}</h1><div className="result-score">{result.percentage}%</div><p>{result.correct} correct out of {result.total} questions</p>{result.saved && <span className="badge">+{result.xp} XP {result.ranked ? '· Public ranking eligible' : '· Private progress'}</span>}</>}<div className="alert">{result.saved ? 'Saved to your account. Your history and progress sync across devices.' : <>Guest result—not saved. <Link href="/auth">Sign in</Link> to save future quizzes.</>}</div><div className="row" style={{ justifyContent: 'center' }}><button className="button" onClick={reset}>Play again</button><button className="button secondary" onClick={() => void share()}>Share result</button><Link href="/quizzes" className="button secondary">More quizzes</Link></div>{sharing && <p aria-live="polite">{sharing}</p>}</section>{!!result.review.length && <section className="card section"><h2>Answers and explanations</h2>{result.review.map((item, questionIndex) => <div className="review" key={questionIndex}><h3><span className={item.correct ? 'correct' : 'incorrect'}>{item.correct ? '✓' : '✕'}</span> {questionIndex + 1}. {item.text}</h3><p className="muted">Your answer: {item.submitted}</p>{!item.correct && <p className="correct">Correct answer: {item.answer}</p>}<p>{item.explanation}</p></div>)}</section>}</>}
  </div>;
}
