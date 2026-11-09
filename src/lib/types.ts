export type Language = "en" | "ur";
export type Localized = { en: string; ur?: string };
export type QuestionType = "mcq" | "true-false" | "fill-blanks";
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  question_ur?: string;
  options?: { en: string[]; ur?: string[] };
  correctAnswer: number | boolean | string;
  correctAnswer_ur?: string;
  explanation?: string;
  explanation_ur?: string;
  hint?: string;
  hint_ur?: string;
  timeLimit: number;
  source?: { title: string; url: string };
}
export interface QuizCategory {
  id: string;
  name: Localized;
  description: Localized;
  difficulty: string;
  count: number;
  types: QuestionType[];
  group: string;
  color: string;
  icon: string;
}
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  example?: string;
  image?: string | null;
  mnemonic?: string;
  reference?: string;
}
export interface Deck {
  id: string;
  title: string;
  category: string;
  group: string;
  description: string;
  tags: string[];
  difficulty: string;
  cards: Flashcard[];
}
export interface PersonalityQuiz {
  id: string;
  title: string;
  title_ur?: string;
  description: string;
  description_ur?: string;
  image: string;
  time: number;
  questions: {
    question: string;
    question_ur?: string;
    options: {
      text: string;
      text_ur?: string;
      emoji: string;
      points: Record<string, number>;
    }[];
  }[];
  results: Record<
    string,
    {
      title: string;
      title_ur?: string;
      description: string;
      description_ur?: string;
      emoji: string;
      image: string;
    }
  >;
}
export interface Profile {
  name: string;
  country: string;
  age: string;
  level: string;
  gender: string;
}
export interface QuizResult {
  id: string;
  category: string;
  title: string;
  score: number;
  total: number;
  skipped: number;
  seconds: number;
  date: string;
}
export interface PersonalityResult {
  id: string;
  quizId: string;
  title: string;
  result: string;
  date: string;
}
export interface CardProgress {
  learned: boolean;
  difficult: boolean;
  reviewedAt: string;
  dueAt: string;
}
// Individual timestamped entries (including deletion tombstones) avoid whole-profile overwrite races.
export interface Entry {
  value: unknown;
  updatedAt: number;
  deleted?: boolean;
}
export type Entries = Record<string, Entry>;
