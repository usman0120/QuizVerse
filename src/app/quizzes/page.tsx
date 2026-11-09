import { QuizCatalog } from "@/components/catalog";
import { getQuizCategories } from "@/lib/content";
export const metadata = { title: "Quiz Categories" };
export default async function Page() {
  return <QuizCatalog categories={await getQuizCategories()} />;
}
