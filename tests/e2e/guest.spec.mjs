import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('guest knowledge quiz is server graded correctly in English and Urdu', async ({ request }) => {
  const source = JSON.parse(await readFile('data/questions/general_knowledge.json', 'utf8'));
  for (const language of ['en', 'ur']) {
    const start = await request.post('/api/quiz/start', { data: { category: 'general_knowledge', count: 10, language } });
    expect(start.ok()).toBeTruthy();
    const session = await start.json();
    expect(session.questions).toHaveLength(10);
    expect(JSON.stringify(session)).not.toContain('correctAnswer');
    expect(JSON.stringify(session)).not.toContain('explanation');
    const payload = JSON.parse(Buffer.from(session.token.split('.')[0], 'base64url').toString());
    const answers = payload.entries.map(entry => {
      const question = source.questions[Number(entry.id)];
      if (question.type === 'fill-blanks') return question.correctAnswer;
      const correct = question.type === 'true-false' ? (question.correctAnswer ? 0 : 1) : question.correctAnswer;
      return entry.order.indexOf(correct);
    });
    const submit = await request.post('/api/quiz/submit', { data: { token: session.token, answers } });
    expect(submit.ok()).toBeTruthy();
    const result = await submit.json();
    expect(result.percentage).toBe(100);
    expect(result.saved).toBe(false);
    expect(result.xp).toBe(0);
    expect(result.review).toHaveLength(10);
    const tampered = await request.post('/api/quiz/submit', { data: { token: `x${session.token}`, answers } });
    expect(tampered.status()).toBe(400);
  }
});

test('daily question identities are stable and personality results are unranked', async ({ request }) => {
  const first = await (await request.post('/api/quiz/start', { data: { category: 'daily' } })).json();
  const second = await (await request.post('/api/quiz/start', { data: { category: 'daily' } })).json();
  expect(first.questions.map(question => question.id)).toEqual(second.questions.map(question => question.id));
  expect(first.questions).toHaveLength(5);
  expect(new Set(first.questions.map(question => question.text)).size).toBe(5);
  const quiz = await (await request.post('/api/quiz/start', { data: { category: 'pakistani-city', kind: 'personality' } })).json();
  const submitted = await request.post('/api/quiz/submit', { data: { token: quiz.token, answers: quiz.questions.map(() => 0) } });
  const result = await submitted.json();
  expect(submitted.ok()).toBeTruthy();
  expect(result.personality.title).toBeTruthy();
  expect(result.ranked).toBe(false);
  expect(result.saved).toBe(false);
  expect(result.xp).toBe(0);
});

test('invalid categories, oversized bodies, and anonymous account writes are rejected', async ({ request }) => {
  expect((await request.post('/api/quiz/start', { data: { category: '../../secrets' } })).status()).toBe(400);
  expect((await request.post('/api/quiz/start', { data: { category: 'missing_category' } })).status()).toBe(404);
  expect((await request.post('/api/quiz/start', { data: { category: 'general_knowledge', junk: 'x'.repeat(35000) } })).status()).toBe(413);
  expect((await request.patch('/api/account', { data: { displayName: 'Fake name' } })).status()).toBe(401);
  expect((await request.post('/api/flashcards/progress', { data: { cardId: 'advanced-math:0', status: 'learned' } })).status()).toBe(401);
  expect((await request.get('/data/questions/general_knowledge.json')).status()).toBe(404);
  expect((await request.get('/learn.html')).status()).toBe(404);
  expect((await request.get('/learning-categories.html')).status()).toBe(404);
});

test('guest UI completes a quiz without saved progress or browser errors', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/quiz?cat=general_knowledge');
  await page.getByRole('combobox', { name: 'Questions', exact: true }).selectOption('5');
  await page.getByRole('button', { name: /Start quiz/ }).click();
  await expect(page.locator('.question-text')).toBeVisible();
  await page.getByRole('button', { name: 'Switch to Urdu' }).click();
  await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.player')).toHaveAttribute('lang', 'en');
  for (let index = 0; index < 5; index++) {
    const choices = page.getByRole('group', { name: 'Answer choices' });
    await expect(page.locator('.question-text')).toBeVisible();
    if (await choices.count()) await choices.getByRole('button').first().click();
    else await page.getByLabel('Your answer', { exact: true }).fill('Test');
    await page.getByRole('button', { name: index === 4 ? 'Finish quiz' : 'Next question' }).click();
  }
  await expect(page.getByText('Answers and explanations')).toBeVisible();
  await expect(page.getByText('Guest result—not saved.', { exact: false })).toBeVisible();
  const storage = await page.evaluate(() => Object.keys(localStorage));
  expect(storage.some(key => /history|score|progress|profile/i.test(key))).toBe(false);
  expect(errors).toEqual([]);
});

test('catalog search, preferences, legacy redirects, and mobile navigation work', async ({ page }) => {
  await page.goto('/quiz-categories.html');
  await expect(page).toHaveURL(/\/quizzes$/);
  await page.getByLabel('Search categories').fill('not-a-real-category');
  await expect(page.getByText('No categories match.')).toBeVisible();
  await page.getByLabel('Search categories').fill('biology');
  await expect(page.locator('.card-link')).toHaveCount(1);
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to Urdu' }).click();
  await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: 'Toggle navigation' });
  await expect(menu).toBeVisible(); await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  const main = page.locator('#main-nav');
  await expect(main).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('flashcards flip by keyboard and cannot save marks as a guest', async ({ page }) => {
  await page.goto('/flashcards');
  await page.getByRole('button', { name: 'Study deck' }).first().click();
  const card = page.locator('.flashcard');
  await expect(card).toHaveAccessibleName(/^Question:/);
  await card.focus(); await page.keyboard.press('Enter');
  await expect(card).toHaveAccessibleName(/^Answer:/);
  await expect(page.getByRole('button', { name: '✓ Learned', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '↻ Difficult', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
  await expect(card).toHaveAccessibleName(/^Question:/);
});
