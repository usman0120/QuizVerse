"use client";

import Link from "next/link";
import { useState } from "react";
import { calculateStreak } from "@/lib/quiz";
import { quotes } from "@/lib/quotes";
import type {
  PersonalityQuiz,
  Question,
  QuizCategory,
  QuizResult,
} from "@/lib/types";
import { useApp } from "./provider";
import { QuizPlayer } from "./quiz-player";
import { Leaderboard } from "./leaderboard";
import {
  CONTACT_URL,
  downloadCard,
  Icon,
  Media,
  Notice,
  ContentText,
} from "./ui";

export function Home({
  categories,
  personality,
  daily,
  quoteIndex,
}: {
  categories: QuizCategory[];
  personality: PersonalityQuiz[];
  daily: Question[];
  quoteIndex: number;
}) {
  const app = useApp();
  const [quoteCategory, setQuoteCategory] = useState("all");
  const [quoteId, setQuoteId] = useState(quoteIndex);
  const [message, setMessage] = useState("");
  const quote = quotes[quoteId];
  const favorite = app.get<boolean>(`quote:${quoteId}`, false);
  const streak = calculateStreak(app.list<string>("activity:"));
  const results = app.list<QuizResult>("result:");
  async function copyQuote() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(`“${quote.text}” — ${quote.author}`);
      setMessage("Quote copied.");
    } catch {
      setMessage("Clipboard unavailable. Try Download instead.");
    }
  }
  const headings = (title: string, description: string) => (
    <div className="text-center mb-12">
      <h2 className="section-title">{title}</h2>
      <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
  return (
    <>
      <section
        id="home"
        className="relative bg-gradient-to-r from-brand to-secondary text-white py-16 md:py-24 min-h-[calc(100vh-72px)] flex items-center overflow-hidden"
      >
        <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Test Your Knowledge with{" "}
              <span className="text-accent">QuizVerse</span>
            </h1>
            <p className="text-lg mb-6">
              Challenge yourself with free quizzes on a variety of topics.
              Learn, compete, and have fun!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/quizzes" className="btn-accent">
                Start Quiz Now
                <Icon name="arrow-right" />
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-md mx-auto">
            <div
              aria-hidden="true"
              className="absolute -top-6 -start-6 w-32 h-32 bg-accent rounded-full opacity-20 animate-pulse"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -end-6 w-32 h-32 bg-accent rounded-full opacity-20 animate-pulse"
            />
            <div
              id="daily-challenge"
              className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20"
            >
              <QuizPlayer
                questions={daily}
                category="daily"
                title="Daily Challenge"
                embedded
              />
            </div>
          </div>
        </div>
      </section>
      <section id="quote-of-the-day" className="section">
        <div className="container mx-auto px-4">
          {headings(
            "Quote of the Day",
            "A little inspiration for your learning journey.",
          )}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["all", "motivational", "islamic", "urdu", "famous", "wisdom"].map(
              (category) => (
                <button
                  key={category}
                  className={`rounded-full px-4 py-2 capitalize ${quoteCategory === category ? "bg-brand text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                  onClick={() => {
                    setQuoteCategory(category);
                    const candidates = quotes
                      .map((q, i) => ({ q, i }))
                      .filter(
                        ({ q }) =>
                          category === "all" || q.category === category,
                      );
                    setQuoteId(
                      candidates[Math.floor(Math.random() * candidates.length)]
                        .i,
                    );
                  }}
                >
                  {category}
                </button>
              ),
            )}
          </div>
          <div className="max-w-4xl mx-auto panel relative overflow-hidden p-8 md:p-10">
            <div
              aria-hidden="true"
              className="absolute top-0 end-0 w-48 h-48 rounded-full bg-secondary/10 blur-xl animate-blob"
            />
            <div className="relative text-center">
              <Icon
                name="quote-left"
                className="text-4xl text-brand dark:text-secondary mb-6"
              />
              <blockquote>
                <p
                  className={`text-xl md:text-2xl italic mb-6 ${quote.category === "urdu" ? "urdu" : ""}`}
                  dir={quote.category === "urdu" ? "rtl" : "ltr"}
                >
                  {quote.text}
                </p>
                <footer className="font-semibold text-brand dark:text-secondary">
                  Attributed to {quote.author}
                </footer>
              </blockquote>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 mb-6">
                Original collection; attributions have not been independently
                verified.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  className="btn"
                  onClick={() => {
                    const ids = quotes
                      .map((q, i) => ({ q, i }))
                      .filter(
                        ({ q }) =>
                          quoteCategory === "all" ||
                          q.category === quoteCategory,
                      );
                    setQuoteId(ids[Math.floor(Math.random() * ids.length)].i);
                  }}
                >
                  <Icon name="sync" />
                  New Quote
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    void copyQuote();
                  }}
                >
                  <Icon name="copy" />
                  Copy
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    void downloadCard(
                      "Daily Wisdom",
                      [quote.text, `Attributed to ${quote.author}`],
                      "quizverse-quote.png",
                    ).catch(() => setMessage("Image download unavailable."));
                  }}
                >
                  <Icon name="download" />
                  Download
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => app.set(`quote:${quoteId}`, !favorite)}
                >
                  <Icon
                    name="heart"
                    className={favorite ? "text-red-500" : ""}
                  />
                  {favorite ? "Favorited" : "Favorite"}
                </button>
              </div>
              {message && <Notice>{message}</Notice>}
            </div>
          </div>
        </div>
      </section>
      <section id="categories" className="section bg-bgLight dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {headings(
            "Explore Categories",
            "Choose from our quiz categories to test your knowledge.",
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((c) => (
              <Link
                key={c.id}
                href={`/quiz?cat=${c.id}`}
                className="rounded-lg p-4 border-2 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: `${c.color}10`,
                  borderColor: `${c.color}40`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ color: c.color, backgroundColor: `${c.color}20` }}
                >
                  <Icon name={c.icon} className="text-2xl" />
                </div>
                <h3 className="font-bold">
                  <ContentText {...c.name} />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {c.count} questions
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/quizzes" className="btn rounded-full px-6 py-3">
              View All Categories →
            </Link>
          </div>
        </div>
      </section>
      <section
        id="personality-tests"
        className="section bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          {headings(
            "Discover Yourself",
            "Fun quizzes to explore your preferences and personality.",
          )}
          <div className="grid md:grid-cols-3 gap-8">
            {personality.slice(0, 3).map((q) => (
              <Link
                key={q.id}
                href="/personality"
                className="relative group block rounded-2xl shadow-xl overflow-hidden min-h-96"
              >
                <Media
                  src={q.image}
                  alt={q.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand/60 to-secondary/95" />
                <div className="relative min-h-96 h-full flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-bold mb-3">
                    <ContentText en={q.title} ur={q.title_ur} />
                  </h3>
                  <p className="mb-4 opacity-90">
                    <ContentText en={q.description} ur={q.description_ur} />
                  </p>
                  <span className="font-medium">Take the Test →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link className="btn rounded-full px-6 py-3" href="/personality">
              Explore All Personality Tests →
            </Link>
          </div>
        </div>
      </section>
      <section id="features" className="section bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          {headings(
            "Why Choose QuizVerse?",
            "Everything you need for an enjoyable learning experience.",
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              [
                "trophy",
                "Casual Leaderboards",
                "Share your quiz results with the community, if you choose.",
              ],
              [
                "calendar-day",
                "Daily Challenges",
                "A consistent daily set of questions from our own collection.",
              ],
              [
                "chart-line",
                "Progress Tracking",
                "Track your quiz results, history, and activity streak.",
              ],
              [
                "cloud",
                "Cloud Sync",
                "Sign in to continue learning across your devices.",
              ],
              [
                "language",
                "English & Urdu",
                "Switch languages and explore bilingual quiz content.",
              ],
              [
                "mobile-alt",
                "Mobile Friendly",
                "Learn wherever you are with a responsive interface.",
              ],
            ].map(([icon, title, text]) => (
              <article
                key={title}
                className="text-center p-6 bg-bgLight dark:bg-gray-700 rounded-xl"
              >
                <div className="w-16 h-16 bg-brand/10 text-brand dark:text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={icon} className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="leaderboard" className="section bg-bgLight dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {headings(
            "Top Players",
            "Recent results from the QuizVerse community.",
          )}
          <div className="max-w-4xl mx-auto">
            <Leaderboard preview />
          </div>
          <div className="text-center mt-8">
            <Link className="btn" href="/leaderboard">
              View Casual Leaderboard
            </Link>
          </div>
        </div>
      </section>
      <section className="section bg-gradient-to-r from-brand to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Your QuizVerse Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              [results.length, "Quizzes completed"],
              [streak, "Day streak"],
              [app.list("quote:").filter(Boolean).length, "Favorite quotes"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-4xl font-bold text-accent mb-2">{value}</p>
                <p>{label}</p>
              </div>
            ))}
          </div>
          <Link href="/account" className="inline-block mt-8 underline">
            View your profile and progress
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title">Ready to Challenge Yourself?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Choose a quiz and keep learning. No account required to start.
          </p>
          <Link className="btn-accent me-4" href="/quizzes">
            Start Quiz Now →
          </Link>
          <a className="btn-secondary" href={CONTACT_URL}>
            Share a suggestion
          </a>
        </div>
      </section>
    </>
  );
}
