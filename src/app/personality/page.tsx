import { Personality } from "@/components/personality";
import { getPersonalityQuizzes } from "@/lib/content";
export const metadata = { title: "Personality Tests" };
export default async function Page() {
  return <Personality quizzes={await getPersonalityQuizzes()} />;
}
