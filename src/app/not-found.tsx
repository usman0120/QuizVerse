import Link from 'next/link';
export default function NotFound() { return <section className="card narrow center"><p className="eyebrow">404</p><h1 style={{ fontSize: '2rem' }}>That page isn’t here.</h1><p className="muted">The page or quiz may have been removed, or the link may be incorrect.</p><Link href="/quizzes" className="button">Explore available quizzes</Link></section>; }
