import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { uniqueQuestions } from '../src/lib/quiz-core.mjs';

const directory = new URL('../data/questions/', import.meta.url);
const report = { files: 0, questions: 0, structurallyValidQuestions: 0, playableQuestions: 0, emptyFiles: [], invalidFiles: [], invalidQuestions: [], quarantinedQuestions: [], duplicateIds: [], duplicateQuestions: [], duplicateFiles: [], types: {}, missingTranslations: 0 };
const hashes = new Map();
const prompts = new Map();
for (const file of (await readdir(directory)).filter(name => name.endsWith('.json')).sort()) {
  report.files++;
  const text = await readFile(new URL(file, directory), 'utf8');
  if (!text.trim()) { report.emptyFiles.push(file); continue; }
  const hash = createHash('sha256').update(text).digest('hex');
  if (hashes.has(hash)) report.duplicateFiles.push([hashes.get(hash), file]);
  else hashes.set(hash, file);
  let data;
  try { data = JSON.parse(text); } catch (error) { report.invalidFiles.push({ file, reason: error.message }); continue; }
  if (!Array.isArray(data.questions)) { report.invalidFiles.push({ file, reason: 'Missing questions array' }); continue; }
  report.playableQuestions += uniqueQuestions(data.questions, file.slice(0, -5)).length;
  const ids = new Set();
  data.questions.forEach((question, index) => {
    report.questions++;
    const type = question?.type ?? 'missing';
    report.types[type] = (report.types[type] ?? 0) + 1;
    const location = `${file}#${index + 1}`;
    if (ids.has(question?.id)) report.duplicateIds.push({ file, id: question?.id, index });
    ids.add(question?.id);
    if (!question?.question_ur) report.missingTranslations++;
    const prompt = String(question?.question ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (prompt) {
      if (prompts.has(prompt)) report.duplicateQuestions.push({ first: prompts.get(prompt), duplicate: location, prompt });
      else prompts.set(prompt, location);
    }
    let reason;
    if (!prompt) reason = 'Missing question text';
    else if (type === 'mcq') {
      const choices = Array.isArray(question.options) ? question.options : question.options?.en;
      if (!Array.isArray(choices) || choices.length < 2 || choices.some(choice => typeof choice !== 'string' || !choice.trim())) reason = 'Invalid choices';
      else if (!Number.isInteger(question.correctAnswer) || question.correctAnswer < 0 || question.correctAnswer >= choices.length) reason = 'Correct answer outside choices';
    } else if (type === 'true-false') {
      if (typeof question.correctAnswer !== 'boolean') reason = 'True/false answer must be boolean';
    } else if (['fill-in-the-blank', 'fill-blank', 'fill-blanks'].includes(type)) {
      if (typeof question.correctAnswer !== 'string' || !question.correctAnswer.trim()) reason = 'Missing text answer';
    } else reason = `Unsupported question type: ${type}`;
    if (reason) report.invalidQuestions.push({ file, index, id: question?.id, reason });
    else report.structurallyValidQuestions++;
    if (file === 'history.json' && type === 'mcq') report.quarantinedQuestions.push({ file, index, id: question.id, reason: 'Mixed answer-index conventions; editorial review required' });
  });
}
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/data-audit.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, quarantinedQuestions: `${report.quarantinedQuestions.length} History MCQs withheld`, invalidQuestions: report.invalidQuestions.slice(0, 12), duplicateIds: report.duplicateIds.slice(0, 5), duplicateQuestions: `${report.duplicateQuestions.length} occurrences (see docs/data-audit.json)` }, null, 2));
