"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { firebaseServices, friendlyError } from "@/lib/firebase";
import { isCorrect, localDay, shuffle } from "@/lib/quiz";
import type { Language, Question, QuizResult } from "@/lib/types";
import { useApp } from "./provider";
import {
  celebrate,
  downloadCard,
  downloadText,
  Icon,
  Notice,
  shareText,
  Text,
} from "./ui";

interface Answer {
  value: number | boolean | string | null;
  correct: boolean;
  skipped: boolean;
}
export function QuizPlayer({
  questions: pool,
  category,
  title,
  embedded = false,
  initialLanguage,
}: {
  questions: Question[];
  category: string;
  title: string;
  embedded?: boolean;
  initialLanguage?: Language;
}) {
  const app = useApp();
  const [phase, setPhase] = useState<"setup" | "play" | "result">("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [typed, setTyped] = useState("");
  const [timed, setTimed] = useState(!embedded);
  const [remaining, setRemaining] = useState(0);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [message, setMessage] = useState("");
  const started = useRef(0);
  const deadline = useRef(0);
  const locked = useRef(false);
  const finished = useRef(false);
  const appliedLanguage = useRef(false);
  const language = app.settings.language;
  const ready = app.ready;
  const updateSettings = app.updateSettings;
  useEffect(() => {
    if (initialLanguage && ready && !appliedLanguage.current) {
      appliedLanguage.current = true;
      updateSettings({ language: initialLanguage });
    }
  }, [initialLanguage, ready, updateSettings]);
  const question = questions[index];
  const answered = answers[index];
  const text = (q: Question, field: "question" | "hint" | "explanation") =>
    language === "ur" ? q[`${field}_ur`] || q[field] : q[field];

  function start() {
    const chosen = embedded ? [...pool] : shuffle(pool).slice(0, 10);
    if (!chosen.length || !app.ready) return;
    setQuestions(chosen);
    setIndex(0);
    setAnswers([]);
    setTyped("");
    setHints(0);
    setShowHint(false);
    setResult(null);
    setMessage("");
    started.current = Date.now();
    deadline.current = Date.now() + chosen[0].timeLimit * 1000;
    locked.current = false;
    finished.current = false;
    setRemaining(chosen[0].timeLimit);
    setPhase("play");
  }
  function submit(value: Answer["value"], skipped = false) {
    if (locked.current || !question || phase !== "play") return;
    locked.current = true;
    const correct = value !== null && isCorrect(question, value, language);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { value, correct, skipped };
      return next;
    });
    if (app.settings.vibration && "vibrate" in navigator)
      navigator.vibrate(correct ? 40 : [40, 40, 40]);
    if (app.settings.sound) {
      try {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.connect(gain);
        gain.connect(audio.destination);
        gain.gain.value = 0.05;
        oscillator.frequency.value = correct ? 660 : 220;
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.12);
        oscillator.onended = () => {
          void audio.close();
        };
      } catch {
        /* Sound is optional; unsupported browsers keep working. */
      }
    }
  }
  useEffect(() => {
    if (phase !== "play" || !timed || answered || !question) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(left);
      if (!left && !locked.current) {
        locked.current = true;
        setAnswers((prev) => {
          const next = [...prev];
          next[index] = { value: null, correct: false, skipped: true };
          return next;
        });
      }
    };
    const timer = window.setInterval(tick, 250);
    const visible = () => tick();
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [phase, timed, answered, question, index]);

  function next() {
    if (!answered || finished.current) return;
    if (index + 1 >= questions.length) {
      finished.current = true;
      const score = answers.filter((a) => a.correct).length;
      const data: QuizResult = {
        id: crypto.randomUUID(),
        category,
        title,
        score,
        total: questions.length,
        skipped: answers.filter((a) => a.skipped).length,
        seconds: Math.floor((Date.now() - started.current) / 1000),
        date: new Date().toISOString(),
      };
      app.set(`result:${data.id}`, data);
      app.set(`activity:${localDay()}`, localDay());
      setResult(data);
      setPhase("result");
      if (score >= questions.length * 0.8) void celebrate();
    } else {
      const nextIndex = index + 1;
      deadline.current = Date.now() + questions[nextIndex].timeLimit * 1000;
      locked.current = false;
      setIndex(nextIndex);
      setTyped("");
      setShowHint(false);
      setRemaining(questions[nextIndex].timeLimit);
    }
  }
  async function publish() {
    if (!app.user || !result) {
      setMessage(
        "Sign in to publish a casual score. Your result is already saved locally.",
      );
      return;
    }
    try {
      await setDoc(
        doc(
          firebaseServices().db,
          "quizverse_scores",
          `${app.user.uid}_${result.id}`,
        ),
        {
          uid: app.user.uid,
          displayName: app.profile.name.slice(0, 60) || "Quiz player",
          category: result.category,
          title: result.title.slice(0, 120),
          score: result.score,
          total: result.total,
          seconds: result.seconds,
          date: result.date,
        },
      );
      setMessage(
        "Published to the casual leaderboard. Only your display name and quiz result are public.",
      );
    } catch (e) {
      setMessage(friendlyError(e));
    }
  }
  const wrapper = embedded ? "" : "page max-w-4xl";
  if (!pool.length)
    return (
      <div className={wrapper}>
        <Notice>
          No questions are available for this category or question type.
        </Notice>
        <Link className="btn" href="/quizzes">
          Choose another quiz
        </Link>
      </div>
    );
  if (phase === "setup")
    return (
      <div className={wrapper}>
        <div className={embedded ? "" : "panel text-center"}>
          <h1 className={embedded ? "text-xl font-bold mb-4" : "section-title"}>
            {title}
          </h1>
          <p className="mb-6">
            {Math.min(embedded ? 5 : 10, pool.length)} questions · English &
            Urdu
          </p>
          {!embedded && (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Answer each question once. Use up to three hints, skip a
                question, and review your answers at the end.
              </p>
              <label className="flex justify-center gap-3 mb-6">
                <input
                  type="checkbox"
                  checked={timed}
                  onChange={(e) => setTimed(e.target.checked)}
                />
                Timed mode
              </label>
              <div className="flex justify-center gap-5 mb-6">
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={app.settings.sound}
                    onChange={(e) =>
                      app.updateSettings({ sound: e.target.checked })
                    }
                  />
                  Sound
                </label>
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={app.settings.vibration}
                    onChange={(e) =>
                      app.updateSettings({ vibration: e.target.checked })
                    }
                  />
                  Vibration
                </label>
              </div>
            </>
          )}
          <button className="btn-accent" onClick={start} disabled={!app.ready}>
            <Text en="Start Quiz" ur="کوئز شروع کریں" />
            <Icon name="arrow-right" />
          </button>
          {!embedded && (
            <Link
              className="block mt-4 text-brand dark:text-secondary"
              href="/quizzes"
            >
              Choose another category
            </Link>
          )}
        </div>
      </div>
    );
  if (phase === "result" && result)
    return (
      <div className={wrapper}>
        <div className={embedded ? "" : "panel text-center"}>
          <div className="text-5xl mb-4">
            {result.score >= result.total * 0.8 ? "🏆" : "🎯"}
          </div>
          <h2 className="text-2xl font-bold mb-4">
            <Text en="Quiz Completed!" ur="کوئز مکمل ہو گیا!" />
          </h2>
          <p className="text-4xl font-bold text-accent mb-4">
            {result.score}/{result.total}
          </p>
          <p className="mb-6">
            {result.total - result.score - result.skipped} incorrect ·{" "}
            {result.skipped} skipped · {result.seconds}s
          </p>
          <p className="text-sm mb-4">
            {app.user
              ? app.sync
              : "Saved on this device. Sign in to sync your progress."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn" onClick={start}>
              Try Again
            </button>
            <button
              className="btn-secondary"
              onClick={() =>
                downloadText(
                  "quizverse-result.json",
                  JSON.stringify(result, null, 2),
                  "application/json",
                )
              }
            >
              <Icon name="download" />
              Download
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                void downloadCard(
                  title,
                  [
                    `Score: ${result.score}/${result.total}`,
                    `${result.seconds}s · ${app.profile.name}`,
                  ],
                  "quizverse-result.png",
                ).catch(() =>
                  setMessage(
                    "Image download unavailable. Use the JSON download instead.",
                  ),
                );
              }}
            >
              <Icon name="image" />
              Download Image
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                void shareText(
                  "QuizVerse result",
                  `I scored ${result.score}/${result.total} in ${title}!`,
                )
                  .then(() => setMessage("Shared or copied to clipboard."))
                  .catch((e) =>
                    setMessage(
                      e instanceof Error ? e.message : "Sharing cancelled.",
                    ),
                  );
              }}
            >
              <Icon name="share-alt" />
              Share
            </button>
            {!embedded && (
              <button
                className="btn-accent"
                onClick={() => {
                  void publish();
                }}
              >
                Publish casual score
              </button>
            )}
          </div>
          {message && <Notice>{message}</Notice>}
          {!embedded && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-5">
                Public scores are client-reported and not verified. No age,
                email, or country is published.
              </p>
              <details className="text-start mt-8">
                <summary className="cursor-pointer font-bold">
                  Review your answers
                </summary>
                <div className="grid gap-4 mt-4">
                  {questions.map((q, i) => (
                    <div
                      className="bg-bgLight dark:bg-gray-700 rounded-lg p-4"
                      key={q.id}
                    >
                      <h3 className="font-medium">
                        {i + 1}. {text(q, "question")}
                      </h3>
                      <p className="my-2">
                        {answers[i]?.correct
                          ? "✓ Correct"
                          : answers[i]?.skipped
                            ? "Skipped"
                            : "✗ Incorrect"}
                      </p>
                      <p className="text-sm">{text(q, "explanation")}</p>
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}
        </div>
      </div>
    );
  const options: { label: string; value: number | boolean }[] =
    question.type === "mcq"
      ? (question.options?.[language] || question.options?.en || []).map(
          (label, value) => ({ label, value }),
        )
      : [
          { label: language === "ur" ? "درست" : "True", value: true },
          { label: language === "ur" ? "غلط" : "False", value: false },
        ];
  return (
    <div className={wrapper}>
      <div
        className={embedded ? "" : "panel"}
        dir={language === "ur" ? "rtl" : "ltr"}
      >
        <div className="flex justify-between text-sm mb-3">
          <p>
            {index + 1}/{questions.length}
          </p>
          {timed && (
            <p aria-label="Time remaining">
              <Icon name="clock" /> {remaining}s
            </p>
          )}
          <p>Score: {answers.filter((a) => a.correct).length}</p>
        </div>
        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={answers.length}
          className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden"
        >
          <div
            className="h-full bg-accent"
            style={{ width: `${(answers.length / questions.length) * 100}%` }}
          />
        </div>
        <h2
          className={`font-bold mb-6 ${embedded ? "text-lg" : "text-2xl"} ${language === "ur" ? "urdu" : ""}`}
        >
          {text(question, "question")}
        </h2>
        {question.type === "fill-blanks" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim()) submit(typed);
            }}
          >
            <label>
              Your answer
              <input
                className="field"
                autoComplete="off"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={!!answered}
              />
            </label>
            <button className="btn mt-4" disabled={!!answered || !typed.trim()}>
              Submit Answer
            </button>
          </form>
        ) : (
          <div
            className={`grid gap-3 ${!embedded && question.type === "mcq" ? "sm:grid-cols-2" : ""}`}
          >
            {options.map((o) => (
              <button
                key={String(o.value)}
                className={`${embedded ? "w-full text-start rounded-lg p-3 bg-white/10 border border-white/30" : "answer"} ${answered && o.value === question.correctAnswer ? "border-green-500 bg-green-500/20" : answered && o.value === answered.value ? "border-red-500 bg-red-500/20" : ""}`}
                onClick={() => submit(o.value)}
                disabled={!!answered}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        {answered && (
          <div
            role="status"
            className={`mt-4 p-4 rounded-lg ${answered.correct ? "bg-green-500/20" : "bg-red-500/20"}`}
          >
            <strong>
              {answered.correct
                ? "Correct!"
                : answered.skipped
                  ? "Question skipped"
                  : "Not quite!"}
            </strong>
            <p className="mt-2 text-sm">
              {text(question, "explanation") ||
                `Answer: ${String(language === "ur" ? question.correctAnswer_ur || question.correctAnswer : question.correctAnswer)}`}
            </p>
            {question.source?.url?.startsWith("https://") && (
              <a
                className="inline-block mt-2 text-sm underline"
                href={question.source.url}
                target="_blank"
                rel="noreferrer"
              >
                Source: {question.source.title}
              </a>
            )}
          </div>
        )}
        {showHint && (
          <Notice>
            {text(question, "hint") || "No hint available for this question."}
          </Notice>
        )}
        <div className="flex flex-wrap gap-3 mt-6 justify-between">
          {!embedded && (
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                disabled={
                  !!answered || hints >= 3 || showHint || !question.hint
                }
                onClick={() => {
                  setShowHint(true);
                  setHints(hints + 1);
                }}
              >
                <Icon name="lightbulb" />
                Hint ({3 - hints})
              </button>
              <button
                className="btn-secondary"
                disabled={!!answered}
                onClick={() => submit(null, true)}
              >
                Skip
              </button>
            </div>
          )}
          <button className="btn-accent" disabled={!answered} onClick={next}>
            {index + 1 === questions.length ? "See Results" : "Next"} →
          </button>
        </div>
      </div>
    </div>
  );
}
