import { Flashcards } from "@/components/flashcards";
import { getDecks } from "@/lib/content";
export const metadata = { title: "Flashcards" };
export default async function Page() {
  return <Flashcards decks={await getDecks()} />;
}
