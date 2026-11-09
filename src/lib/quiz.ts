import type { Language, PersonalityQuiz, Question } from "./types";

export function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");
}
export function isCorrect(
  q: Question,
  answer: number | boolean | string,
  language: Language,
) {
  if (q.type === "fill-blanks") {
    const accepted = [String(q.correctAnswer), q.correctAnswer_ur].filter(
      (x): x is string => !!x,
    );
    return accepted.some(
      (value) => normalizeAnswer(String(answer)) === normalizeAnswer(value),
    );
  }
  // Language only changes the label, never its answer index.
  void language;
  return answer === q.correctAnswer;
}
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function seededRandom(seed: string) {
  let value = 2166136261;
  for (const char of seed)
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return () => {
    value += 0x6d2b79f5;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function normalizeQuestions(
  raw: unknown[],
  category: string,
  answerIndexBase: 0 | 1 = 0,
): Question[] {
  const seen = new Set<string>();
  return raw.flatMap((value, index) => {
    if (!value || typeof value !== "object") return [];
    const source = value as Question;
    const q = {
      ...source,
      correctAnswer:
        source.type === "mcq" && typeof source.correctAnswer === "number"
          ? source.correctAnswer - answerIndexBase
          : source.correctAnswer,
    };
    if (typeof q.question !== "string" || !q.question.trim()) return [];
    if (!["mcq", "true-false", "fill-blanks"].includes(q.type)) return [];
    if (
      q.type === "mcq" &&
      (!Array.isArray(q.options?.en) ||
        q.options.en.length < 2 ||
        !q.options.en.every((option) => typeof option === "string") ||
        !Number.isInteger(q.correctAnswer) ||
        Number(q.correctAnswer) < 0 ||
        Number(q.correctAnswer) >= q.options.en.length)
    )
      return [];
    if (q.type === "true-false" && typeof q.correctAnswer !== "boolean")
      return [];
    if (q.type === "fill-blanks" && typeof q.correctAnswer !== "string")
      return [];
    const key = `${q.type}:${normalizeAnswer(q.question)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [
      {
        ...q,
        id: `${category}:${index}`,
        timeLimit: Math.max(5, Math.min(120, Number(q.timeLimit) || 30)),
      },
    ];
  });
}
export function personalityMatch(quiz: PersonalityQuiz, answers: number[]) {
  const points = Object.fromEntries(
    Object.keys(quiz.results).map((key) => [key, 0]),
  );
  // Recompute from final answers: revisiting a question can never count its points twice.
  quiz.questions.forEach((q, index) => {
    const option = q.options[answers[index]];
    if (!option) return;
    for (const [key, value] of Object.entries(option.points)) {
      if (key in points) points[key] += value;
    }
  });
  return Object.keys(points).sort((a, b) => points[b] - points[a])[0];
}
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function calculateStreak(days: string[], today = localDay()) {
  const unique = new Set(days);
  const cursor = new Date(`${today}T12:00:00`);
  if (!unique.has(today)) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (unique.has(localDay(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
