import { createHash, createHmac, timingSafeEqual, randomInt } from 'node:crypto';

export function normalizeQuestion(question, index) {
  if (!question || typeof question.question !== 'string' || !question.question.trim()) return null;
  const type = ['fill-in-the-blank', 'fill-blank', 'fill-blanks'].includes(question.type) ? 'fill-blanks' : question.type;
  let options = [];
  if (type === 'mcq') {
    options = Array.isArray(question.options) ? question.options : question.options?.en;
    if (!Array.isArray(options) || options.length < 2 || options.some(value => typeof value !== 'string' || !value.trim())) return null;
    if (!Number.isInteger(question.correctAnswer) || question.correctAnswer < 0 || question.correctAnswer >= options.length) return null;
  } else if (type === 'true-false') {
    if (typeof question.correctAnswer !== 'boolean') return null;
    options = ['True', 'False'];
  } else if (type === 'fill-blanks') {
    if (typeof question.correctAnswer !== 'string' || !question.correctAnswer.trim()) return null;
  } else return null;
  return { ...question, id: String(index), type, choices: options };
}

export function uniqueQuestions(questions, category = '') {
  const seen = new Set();
  return questions.flatMap((question, index) => {
    const normalized = normalizeQuestion(question, index);
    if (!normalized) return [];
    // History MCQs demonstrably mix one-based and zero-based answers. Preserve
    // the source but withhold these from grading until an editorial review.
    if (category === 'history' && normalized.type === 'mcq') return [];
    const key = normalized.question.trim().toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) return [];
    seen.add(key);
    return [normalized];
  });
}

export function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) { const j = randomInt(i + 1); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function dailyQuestions(questions, date, count = 5) {
  const ranked = questions.map(question => ({ question, hash: createHash('sha256').update(`${date}:${question.id}`).digest('hex') })).sort((a, b) => a.hash.localeCompare(b.hash));
  const seen = new Set();
  return ranked.flatMap(({ question }) => {
    const key = normalizeText(question.question);
    if (seen.has(key)) return [];
    seen.add(key);
    return [question];
  }).slice(0, count);
}

export function signSession(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${createHmac('sha256', secret).update(encoded).digest('base64url')}`;
}

export function verifySession(token, secret, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 24000) throw new Error('Invalid quiz session.');
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra) throw new Error('Invalid quiz session.');
  const expected = createHmac('sha256', secret).update(encoded).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Invalid quiz session.');
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
  if (!Number.isFinite(payload.expiresAt) || payload.expiresAt <= now) throw new Error('Your quiz expired. Please start again.');
  return payload;
}

export function normalizeText(value) {
  return String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

export function gradeAnswer(question, answer, order, language = 'en') {
  if (question.type === 'fill-blanks') {
    return typeof answer === 'string' && [question.correctAnswer, ...(language === 'ur' && question.correctAnswer_ur ? [question.correctAnswer_ur] : [])].some(value => normalizeText(answer) === normalizeText(value));
  }
  if (!Number.isInteger(answer) || answer < 0 || answer >= order.length) return false;
  const correctIndex = question.type === 'true-false' ? (question.correctAnswer ? 0 : 1) : question.correctAnswer;
  return order[answer] === correctIndex;
}

export function nextStreak(lastActivity, currentStreak, today) {
  if (lastActivity === today) return currentStreak;
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return lastActivity === yesterday.toISOString().slice(0, 10) ? currentStreak + 1 : 1;
}

export function personalityWinner(quiz, answers) {
  const scores = Object.fromEntries(Object.keys(quiz.results).map(key => [key, 0]));
  quiz.questions.forEach((question, index) => {
    const option = question.options[answers[index]];
    if (!option) throw new Error('Answer every personality question.');
    for (const [key, points] of Object.entries(option.points ?? {})) if (key in scores && Number.isFinite(points)) scores[key] += points;
  });
  // Stable content-order tie-breaking; no fabricated accuracy percentages.
  return Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
}
