"use client";

import { useRef, useState } from "react";
import { localDay, personalityMatch } from "@/lib/quiz";
import type { PersonalityQuiz, PersonalityResult } from "@/lib/types";
import { useApp } from "./provider";
import {
  celebrate,
  downloadCard,
  Icon,
  Media,
  Notice,
  PageHeading,
  shareText,
} from "./ui";

export function Personality({ quizzes }: { quizzes: PersonalityQuiz[] }) {
  const app = useApp();
  const [quiz, setQuiz] = useState<PersonalityQuiz | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [visible, setVisible] = useState(6);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const finished = useRef(false);
  const history = app
    .list<PersonalityResult>("personality:")
    .sort((a, b) => b.date.localeCompare(a.date));
  const localized = (en: string, ur?: string) =>
    app.settings.language === "ur" ? ur || en : en;
  function start(selected: PersonalityQuiz) {
    setQuiz(selected);
    setIndex(0);
    setAnswers([]);
    setResult(null);
    setMessage("");
    finished.current = false;
  }
  function next() {
    if (!quiz || answers[index] === undefined || finished.current) return;
    if (index + 1 < quiz.questions.length) {
      setIndex(index + 1);
      return;
    }
    finished.current = true;
    const match = personalityMatch(quiz, answers);
    setResult(match);
    const data: PersonalityResult = {
      id: crypto.randomUUID(),
      quizId: quiz.id,
      title: quiz.title,
      result: match,
      date: new Date().toISOString(),
    };
    app.set(`personality:${data.id}`, data);
    app.set(`activity:${localDay()}`, localDay());
    void celebrate();
  }
  const filtered = quizzes.filter((q) =>
    `${q.title} ${q.title_ur || ""} ${q.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const question = quiz?.questions[index];
  const match = result && quiz?.results[result];
  return (
    <div className="page">
      <PageHeading
        title={{
          en: "Discover Your Personality",
          ur: "اپنی شخصیت دریافت کریں",
        }}
        description={{
          en: "Fun personality quizzes based on your choices. For entertainment and reflection, not scientific or psychological assessment.",
        }}
      />
      {quiz ? (
        <div className="max-w-4xl mx-auto">
          <button
            className="btn-secondary mb-6"
            onClick={() => {
              setQuiz(null);
              setResult(null);
            }}
          >
            ← Back to quizzes
          </button>
          {match ? (
            <section className="panel text-center">
              <div className="text-6xl mb-5">{match.emoji}</div>
              <h2 className="text-3xl font-bold mb-4">
                {localized(match.title, match.title_ur)}
              </h2>
              <Media
                key={match.image}
                src={match.image}
                alt={result || ""}
                className="rounded-xl w-full max-w-md h-64 object-cover mx-auto mb-6"
              />
              <p className="text-lg mb-6">
                {localized(match.description, match.description_ur)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {app.profile.name} · Based on your {quiz.questions.length}{" "}
                answers
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="btn" onClick={() => start(quiz)}>
                  Retake Quiz
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    void downloadCard(
                      quiz.title,
                      [match.title, match.description, app.profile.name],
                      "quizverse-personality.png",
                    ).catch((e) => setMessage(String(e)));
                  }}
                >
                  <Icon name="download" />
                  Download Image
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    void shareText(
                      "QuizVerse personality",
                      `${quiz.title}: ${match.title}`,
                    )
                      .then(() => setMessage("Shared or copied to clipboard."))
                      .catch(() =>
                        setMessage("Sharing cancelled or unavailable."),
                      );
                  }}
                >
                  <Icon name="share-alt" />
                  Share
                </button>
              </div>
            </section>
          ) : question ? (
            <section className="panel">
              <h2 className="text-xl font-bold mb-4">
                {localized(quiz.title, quiz.title_ur)}
              </h2>
              <div className="flex justify-between mb-2 text-sm">
                <p>
                  Question {index + 1}/{quiz.questions.length}
                </p>
                <p>{answers.filter((a) => a !== undefined).length} answered</p>
              </div>
              <progress
                aria-label="Personality quiz progress"
                className="w-full h-2 accent-brand mb-6"
                max={quiz.questions.length}
                value={index}
              />
              <h3 className="text-2xl font-bold mb-6">
                {localized(question.question, question.question_ur)}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    className={`answer ${answers[index] === i ? "answer-selected" : ""}`}
                    aria-pressed={answers[index] === i}
                    onClick={() => {
                      const updated = [...answers];
                      updated[index] = i;
                      setAnswers(updated);
                    }}
                  >
                    <span className="text-3xl me-3">{option.emoji}</span>
                    {localized(option.text, option.text_ur)}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <button
                  className="btn-secondary"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  ← Previous
                </button>
                <button
                  className="btn"
                  disabled={answers[index] === undefined}
                  onClick={next}
                >
                  {index + 1 === quiz.questions.length ? "See Results" : "Next"}{" "}
                  →
                </button>
              </div>
              <button
                className="text-sm mt-4 text-gray-500 dark:text-gray-400"
                onClick={() => {
                  if (
                    window.confirm(
                      "Restart this quiz and clear your current answers?",
                    )
                  )
                    start(quiz);
                }}
              >
                Restart Quiz
              </button>
            </section>
          ) : (
            <Notice>This quiz has no questions.</Notice>
          )}
          {message && <Notice>{message}</Notice>}
        </div>
      ) : (
        <>
          <label className="block max-w-xl mx-auto mb-8">
            Search personality quizzes
            <input
              className="field"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisible(6);
              }}
            />
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, visible).map((q) => (
              <article
                key={q.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 flex flex-col"
              >
                <Media
                  src={q.image}
                  alt={q.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold mb-3">
                    {localized(q.title, q.title_ur)}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">
                    {localized(q.description, q.description_ur)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {q.questions.length} questions · {q.time} min
                  </p>
                  <button
                    className="btn w-full"
                    disabled={!app.ready}
                    onClick={() => start(q)}
                  >
                    Start Quiz →
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && <Notice>No matching quizzes.</Notice>}
          <div className="text-center mt-8">
            {visible < filtered.length ? (
              <button className="btn" onClick={() => setVisible(visible + 6)}>
                Show More
              </button>
            ) : visible > 6 ? (
              <button className="btn-secondary" onClick={() => setVisible(6)}>
                Show Less
              </button>
            ) : null}
          </div>
        </>
      )}
      <section className="panel mt-12">
        <div className="flex justify-between gap-4 mb-5">
          <h2 className="text-2xl font-bold">Your Quiz History</h2>
          <button
            className="text-red-600 dark:text-red-300 text-sm"
            disabled={!history.length}
            onClick={() => {
              if (window.confirm("Clear your personality quiz history?"))
                history.forEach((h) =>
                  app.set(`personality:${h.id}`, null, true),
                );
            }}
          >
            Clear history
          </button>
        </div>
        {!history.length && (
          <p className="text-gray-500 dark:text-gray-400">
            Take a quiz to discover your first match.
          </p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.slice(0, 24).map((h) => (
            <div
              key={h.id}
              className="bg-bgLight dark:bg-gray-700 p-4 rounded-lg"
            >
              <h3 className="font-bold mb-2">{h.title}</h3>
              <p className="text-brand dark:text-secondary">{h.result}</p>
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                {new Date(h.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
