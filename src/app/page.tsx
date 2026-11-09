import { Home } from "@/components/home";
import {
  getDecks,
  getLearningCategories,
  getPersonalityQuizzes,
  getQuestions,
  getQuizCategories,
} from "@/lib/content";
import { seededRandom, shuffle } from "@/lib/quiz";
// UTC daily content is deterministic across users; Vercel refreshes this page hourly.
export const revalidate = 3600;
export default async function Page() {
  const [categories, learning, decks, personality, questions] =
    await Promise.all([
      getQuizCategories(),
      getLearningCategories(),
      getDecks(),
      getPersonalityQuizzes(),
      getQuestions(["general_knowledge"]),
    ]);
  const seed = new Date().toISOString().slice(0, 10);
  const daily = shuffle(
    questions.filter((q) => q.type === "mcq"),
    seededRandom(seed),
  ).slice(0, 5);
  const priority = [
    "general_knowledge",
    "biology",
    "islamic_studies",
    "history",
    "urdu_poetry",
    "computers",
    "arts_culture",
    "kids_special",
    "math",
    "world_facts",
  ];
  const featured = priority.flatMap(
    (id) => categories.find((c) => c.id === id) || [],
  );
  const learningPriority = [
    "science-nature",
    "islamic-studies",
    "history",
    "physics",
  ];
  const featuredLearning = learningPriority.flatMap(
    (id) => learning.find((c) => c.id === id) || [],
  );
  return (
    <Home
      categories={featured}
      learning={featuredLearning}
      decks={decks}
      personality={personality}
      daily={daily}
      quoteIndex={Math.floor(seededRandom(`quote:${seed}`)() * 100)}
    />
  );
}
