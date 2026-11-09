import { getCatalog } from '@/lib/content';
import { QuizCatalog } from '@/components/catalog';
export const metadata = { title: 'Quiz categories' };
export default async function Page() { return <QuizCatalog categories={(await getCatalog()).categories} />; }
