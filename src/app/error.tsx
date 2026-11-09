'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="card narrow center"><h1 style={{ fontSize: '2rem' }}>Something went wrong.</h1><p className="muted">Please try again. If the problem continues, report it through the Contact page.</p><button className="button" onClick={reset}>Try again</button></section>; }
