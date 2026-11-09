"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page text-center">
      <h1 className="section-title">This page couldn’t load</h1>
      <p className="mb-6">
        Please try again. Your saved progress is not affected.
      </p>
      <button className="btn me-3" onClick={reset}>
        Try again
      </button>
      <Link className="btn-secondary" href="/">
        Home
      </Link>
    </div>
  );
}
