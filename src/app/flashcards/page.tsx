import { getFlashDecks } from '@/lib/content';
import { Flashcards } from '@/components/flashcards';
export const metadata = { title: 'Flashcards' };
export default async function Page() { return <Flashcards decks={await getFlashDecks()} />; }
