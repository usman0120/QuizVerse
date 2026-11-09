import { notFound } from "next/navigation";
import { LearningReader } from "@/components/learning-reader";
import { getLearningCategories } from "@/lib/content";
export const metadata = { title: "Learn" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const categories = await getLearningCategories();
  const legacyTopic =
    typeof params.topic === "string" &&
    categories.some((c) => c.id === params.topic)
      ? params.topic
      : undefined;
  const id =
    typeof params.cat === "string"
      ? params.cat.replaceAll("_", "-")
      : legacyTopic || "science-nature";
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();
  const topic =
    !legacyTopic && typeof params.topic === "string"
      ? params.topic
      : typeof params.subsection === "string"
        ? params.subsection
        : typeof params.section === "string"
          ? params.section
          : undefined;
  return (
    <LearningReader
      key={`${category.id}:${topic || ""}`}
      category={category}
      initialTopic={topic}
    />
  );
}
