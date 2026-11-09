import { getPersonalitySummaries } from '@/lib/content';
import { PersonalityCatalog } from '@/components/catalog';
export const metadata = { title: 'Personality quizzes' };
export default async function Page() { return <PersonalityCatalog quizzes={await getPersonalitySummaries()} />; }
