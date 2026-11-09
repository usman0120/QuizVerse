import "server-only";
import { cache } from "react";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sanitizeHtml from "sanitize-html";
import { normalizeQuestions } from "./quiz";
import type {
  Deck,
  LearningCategory,
  LearningTopic,
  Localized,
  PersonalityQuiz,
  QuizCategory,
  Question,
} from "./types";

const root = path.join(process.cwd(), "data");
const readJson = async (file: string) => {
  const text = (await readFile(path.join(root, file), "utf8")).trim();
  return text ? JSON.parse(text) : null;
};
const localized = (value: string | Localized | undefined): Localized =>
  typeof value === "string" ? { en: value } : value || { en: "" };
const themes = {
  science: { group: "Science & Nature", color: "#0077B6", icon: "flask" },
  tech: { group: "Technology", color: "#3A0CA3", icon: "laptop-code" },
  math: { group: "Mathematics", color: "#2D6A4F", icon: "calculator" },
  islamic: { group: "Islamic Studies", color: "#2A9D8F", icon: "mosque" },
  history: { group: "History", color: "#7B5E57", icon: "landmark" },
  poetry: {
    group: "Languages & Literature",
    color: "#A36565",
    icon: "pen-fancy",
  },
  kids: { group: "Kids & Life Skills", color: "#007C91", icon: "child" },
  general: { group: "General Knowledge", color: "#C75F00", icon: "globe" },
};
function theme(id: string) {
  if (/islam|quran|hadith|sahabah|prophets/.test(id)) return themes.islamic;
  if (/urdu|poet|grammar|literature|proverb/.test(id)) return themes.poetry;
  if (/history|ancient|mughal|tareekh|heroes|pakistan/.test(id))
    return themes.history;
  if (/math|algebra|arithmetic|geometry/.test(id)) return themes.math;
  if (/computer|web|robot|cyber|tech|internet|program/.test(id))
    return themes.tech;
  if (/biology|physics|science|chemistry|body/.test(id)) return themes.science;
  if (/kids|animal|birds|life_skills|safety|ethics/.test(id))
    return themes.kids;
  return themes.general;
}
export const getQuizData = cache(async () => {
  const files = await readdir(path.join(root, "questions"));
  const items = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (file) => {
        const data = await readJson(`questions/${file}`);
        if (!data?.questions?.length) return null;
        const id = file.replace(".json", "");
        const questions = normalizeQuestions(
          data.questions,
          id,
          data.meta?.answerIndexBase === 1 ? 1 : 0,
        );
        if (!questions.length) return null;
        const category: QuizCategory = {
          id,
          name: {
            en: data.meta?.category || id.replaceAll("_", " "),
            ur: data.meta?.category_ur,
          },
          description: {
            en: data.meta?.description || "",
            ur: data.meta?.description_ur,
          },
          count: questions.length,
          difficulty: data.meta?.difficulty || "medium",
          types: [...new Set(questions.map((q) => q.type))],
          ...theme(id),
        };
        return { category, questions };
      }),
  );
  return items.filter(
    (item): item is { category: QuizCategory; questions: Question[] } =>
      item !== null,
  );
});
export const getQuizCategories = async () =>
  (await getQuizData()).map((x) => x.category);
export const getQuestions = async (ids: string[]) => {
  const seen = new Set<string>();
  return (await getQuizData())
    .filter((x) => ids.includes(x.category.id))
    .flatMap((x) => x.questions)
    .filter((question) => {
      const key = `${question.type}:${question.question.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};
export function cleanContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "mark",
    ],
    allowedAttributes: {
      "*": ["class"],
      a: ["href", "title"],
      img: ["src", "alt", "loading", "referrerpolicy"],
    },
    allowedSchemes: ["https"],
    allowProtocolRelative: false,
    transformTags: {
      img: (tagName, attribs) =>
        /^https:\/\//.test(attribs.src || "")
          ? {
              tagName,
              attribs: {
                ...attribs,
                loading: "lazy",
                referrerpolicy: "no-referrer",
              },
            }
          : { tagName: "span", attribs: {} },
    },
  });
}
export const getLearningCategories = cache(
  async (): Promise<LearningCategory[]> => {
    const files = await readdir(path.join(root, "learn-data"));
    return Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (file) => {
          const data = await readJson(`learn-data/${file}`);
          const id = file.replace(".json", "");
          const topics: LearningTopic[] = [];
          function addTopic(
            raw: {
              id: string;
              name?: Localized;
              title?: string;
              content?: string | Localized;
              references?: LearningTopic["references"];
              subsections?: Parameters<typeof addTopic>[0][];
            },
            parent?: string,
          ) {
            const content = localized(raw.content);
            topics.push({
              id: raw.id,
              name: localized(raw.name || raw.title),
              content: {
                en: cleanContent(content.en),
                ...(content.ur ? { ur: cleanContent(content.ur) } : {}),
              },
              ...(raw.references ? { references: raw.references } : {}),
              ...(parent ? { parent } : {}),
            });
            raw.subsections?.forEach((child) => addTopic(child, raw.id));
          }
          if (Array.isArray(data)) data.forEach((item) => addTopic(item));
          else
            data.sections?.forEach((section: Parameters<typeof addTopic>[0]) =>
              addTopic(section),
            );
          return {
            id,
            name: localized(data.name || data[0]?.category || id),
            description: localized(data.description || data[0]?.content || ""),
            tags: data.tags || data[0]?.tags || [],
            topics,
            ...theme(id),
            ...(data[0]?.image ? { image: data[0].image } : {}),
          };
        }),
    );
  },
);
export const getDecks = cache(async (): Promise<Deck[]> => {
  const data = await readJson("flashcards.json");
  return data.decks.map((deck: Deck) => ({
    ...deck,
    cards: deck.cards.map((card, index) => ({
      ...card,
      id: `${deck.id}:${index}`,
    })),
  }));
});
export const getPersonalityQuizzes = cache(
  async (): Promise<PersonalityQuiz[]> =>
    Object.values(await readJson("personality-quiz-data.json")),
);
