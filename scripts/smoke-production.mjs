import { spawn } from 'node:child_process';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3101'], {
  env: { ...process.env, QUIZ_SESSION_SECRET: randomBytes(32).toString('hex') },
  stdio: ['ignore', 'pipe', 'pipe'],
});
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Production server did not become ready.')), 30000);
    server.stdout.on('data', chunk => { if (/Ready in/.test(chunk.toString())) { clearTimeout(timeout); resolve(); } });
    server.stderr.on('data', chunk => process.stderr.write(chunk));
    server.once('error', reject);
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Production server exited: ${code}`)); });
  });
  const base = 'http://127.0.0.1:3101';
  for (const route of ['/', '/quizzes', '/quiz?cat=general_knowledge', '/personality', '/flashcards', '/auth', '/account', '/leaderboard', '/about', '/contact', '/privacy', '/terms', '/cookies']) {
    assert.equal((await fetch(`${base}${route}`)).status, 200, route);
  }
  const redirected = await fetch(`${base}/quiz.html?cat=biology`);
  assert.equal(new URL(redirected.url).pathname, '/quiz');
  assert.equal(new URL(redirected.url).searchParams.get('cat'), 'biology');
  assert.equal((await fetch(`${base}/learn.html`)).status, 404);
  assert.equal((await fetch(`${base}/data/questions/general_knowledge.json`)).status, 404);
  const post = (route, data) => fetch(`${base}${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const start = await post('/api/quiz/start', { category: 'general_knowledge', count: 5 });
  assert.equal(start.status, 200);
  const quiz = await start.json();
  assert.equal(quiz.questions.length, 5);
  assert.ok(!JSON.stringify(quiz).includes('correctAnswer'));
  const submitted = await post('/api/quiz/submit', { token: quiz.token, answers: quiz.questions.map(() => null) });
  assert.equal(submitted.status, 200);
  const result = await submitted.json();
  assert.equal(result.correct, 0);
  assert.equal(result.saved, false);
  assert.equal(result.review.length, 5);
  console.log('Production smoke test passed: 13 pages, redirects, removals, private content, and guest server grading.');
} finally {
  if (server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
  }
}
