import { LearningCatalog } from "@/components/catalog";
import { getLearningCategories } from "@/lib/content";
export const metadata = { title: "Learning Hub" };
export default async function Page() {
  return <LearningCatalog categories={await getLearningCategories()} />;
}
