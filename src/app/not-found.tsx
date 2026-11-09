import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page text-center">
      <h1 className="section-title">Page not found</h1>
      <p className="mb-6">This page or category is unavailable.</p>
      <Link className="btn" href="/quizzes">
        Explore quizzes
      </Link>
    </div>
  );
}
