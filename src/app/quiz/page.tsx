import { notFound } from 'next/navigation';
import { getCatalog, getPersonalities } from '@/lib/content';
import { QuizPlayer } from '@/components/quiz-player';
export const metadata = { title: 'Play a quiz' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const category = typeof params.cat === 'string' ? params.cat : 'general_knowledge';
  const kind = params.kind === 'personality' ? 'personality' : 'quiz';
  if (!/^[a-z0-9_-]{1,80}$/.test(category)) notFound();
  const title = kind === 'personality' ? (await getPersonalities())[category]?.title : category === 'daily' ? 'Daily challenge' : (await getCatalog()).categories.find(item => item.id === category)?.name;
  if (!title) notFound();
  return <QuizPlayer key={`${kind}:${category}`} category={category} kind={kind} title={title} />;
}
