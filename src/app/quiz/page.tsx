import { QuizPlayer } from "@/components/quiz-player";
import { getQuizCategories, getQuestions } from "@/lib/content";
import { shuffle } from "@/lib/quiz";
export const metadata = { title: "Quiz Player" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cat = typeof params.cat === "string" ? params.cat : "general_knowledge";
  const categories = await getQuizCategories();
  const alias: Record<string, string> = {
    science_nature: "Science & Nature",
    technology: "Technology",
    kids: "Kids & Life Skills",
    pakistan_studies: "History",
  };
  const ids =
    params.random === "true"
      ? typeof params.cats === "string"
        ? params.cats.split(",").slice(0, 50)
        : categories.map((c) => c.id)
      : alias[cat]
        ? categories.filter((c) => c.group === alias[cat]).map((c) => c.id)
        : [cat];
  const type = typeof params.type === "string" ? params.type : "all";
  const matching = (await getQuestions(ids)).filter(
    (q) => type === "all" || q.type === type,
  );
  // Keep random-quiz payloads bounded rather than sending the entire collection.
  const questions = shuffle(matching).slice(0, 50);
  const title =
    params.random === "true"
      ? "Random Quiz"
      : categories.find((c) => c.id === cat)?.name.en ||
        (alias[cat] ? `${alias[cat]} Quiz` : "Quiz unavailable");
  return (
    <QuizPlayer
      key={`${cat}:${type}:${params.cats || ""}`}
      category={params.random === "true" ? "random" : cat}
      title={title}
      questions={questions}
      initialLanguage={params.lang === "ur" ? "ur" : undefined}
    />
  );
}
