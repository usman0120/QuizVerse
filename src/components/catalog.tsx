'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Category, PersonalitySummary } from '@/lib/types';
import { useApp } from './app-provider';

export function CategoryCards({ categories }: { categories: Category[] }) {
  const { profile } = useApp(); const ur = profile.language === 'ur';
  return <div className="grid">{categories.map((category, index) => <Link key={category.id} href={`/quiz?cat=${category.id}`} className="card card-link"><div className="card-icon" aria-hidden="true">{['🌍', '🔬', '📜', '💡', '🎨', '📖'][index % 6]}</div><h3>{ur ? category.nameUr : category.name}</h3><p>{ur ? category.descriptionUr : category.description}</p>{category.id === 'history' && <small>True/false available. Multiple-choice answers are under review.</small>}<div className="card-meta"><span>{category.count} {ur ? 'سوالات' : 'questions'}</span><span>{category.difficulty}</span></div></Link>)}</div>;
}
export function QuizCatalog({ categories }: { categories: Category[] }) {
  const { profile } = useApp(); const ur = profile.language === 'ur';
  const [search, setSearch] = useState(''); const [difficulty, setDifficulty] = useState('all');
  const filtered = categories.filter(category => `${category.name} ${category.nameUr} ${category.description}`.toLowerCase().includes(search.toLowerCase()) && (difficulty === 'all' || category.difficulty === difficulty));
  return <><div className="eyebrow">{ur ? 'اپنا موضوع منتخب کریں' : 'Find your next challenge'}</div><h1>{ur ? 'کوئز کی اقسام' : 'Quiz categories'}</h1><p className="muted">{ur ? 'اپنی معلومات آزمائیں۔ ہر کوئز میں منفرد سوالات ہیں۔' : 'Real question counts. No empty categories. A new selection every time you play.'}</p><div className="toolbar"><label>{ur ? 'تلاش' : 'Search categories'}<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={ur ? 'موضوع تلاش کریں' : 'History, science, poetry…'} /></label><label>{ur ? 'مشکل' : 'Difficulty'}<select value={difficulty} onChange={event => setDifficulty(event.target.value)}><option value="all">All difficulties</option>{[...new Set(categories.map(category => category.difficulty))].sort().map(value => <option key={value}>{value}</option>)}</select></label></div><p className="muted" aria-live="polite">{filtered.length} {ur ? 'اقسام' : 'categories'}</p>{filtered.length ? <CategoryCards categories={filtered} /> : <div className="card center">No categories match. Try a different search.</div>}</>;
}
export function PersonalityCatalog({ quizzes }: { quizzes: PersonalitySummary[] }) {
  const { profile } = useApp(); const ur = profile.language === 'ur';
  return <><div className="eyebrow">Just for fun</div><h1>{ur ? 'شخصیت کے کوئز' : 'A little more about you'}</h1><p className="muted">For entertainment and reflection—not a psychological assessment. These quizzes do not award leaderboard points.</p><div className="grid">{quizzes.map(quiz => <Link key={quiz.id} href={`/quiz?kind=personality&cat=${quiz.id}`} className="card card-link"><div className="card-icon" aria-hidden="true">✨</div><h3>{ur ? quiz.titleUr : quiz.title}</h3><p>{ur ? quiz.descriptionUr : quiz.description}</p><div className="card-meta"><span>{quiz.count} questions</span><span>Discover →</span></div></Link>)}</div></>;
}
