import { getCatalog } from '@/lib/content';
import { Home } from '@/components/home';
export default async function Page() { const { categories } = await getCatalog(); return <Home categories={categories} totalQuestions={categories.reduce((sum, category) => sum + category.count, 0)} />; }
