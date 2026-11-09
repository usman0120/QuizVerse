"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { firebaseServices, friendlyError } from "@/lib/firebase";
import { Notice, PageHeading } from "./ui";
import { useApp } from "./provider";

interface Score {
  id: string;
  uid: string;
  displayName: string;
  category: string;
  title: string;
  score: number;
  total: number;
  date: string;
}
export function Leaderboard({ preview = false }: { preview?: boolean }) {
  const app = useApp();
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    try {
      const q = query(
        collection(firebaseServices().db, "quizverse_scores"),
        orderBy("date", "desc"),
        limit(100),
      );
      return onSnapshot(
        q,
        (snapshot) => {
          setScores(
            snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Score),
          );
          setError("");
          setLoading(false);
        },
        (e) => {
          setError(friendlyError(e));
          setLoading(false);
        },
      );
    } catch (e) {
      setError(friendlyError(e));
      setLoading(false);
    }
  }, [retry]);
  const ranked = scores
    .filter((s) => !filter || s.category === filter)
    .sort((a, b) => b.score / b.total - a.score / a.total || b.score - a.score)
    .slice(0, preview ? 5 : 100);
  return (
    <div className={preview ? "" : "page"}>
      {!preview && (
        <PageHeading title={{ en: "Casual Leaderboard", ur: "لیڈر بورڈ" }} />
      )}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
        Opt-in, client-reported scores from the latest 100 submissions. These
        results are not verified or suitable for competitive rankings.
      </p>
      {!preview && (
        <label className="block max-w-sm mb-6">
          Filter by quiz
          <select
            className="field"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All quizzes</option>
            {[
              ...new Map(scores.map((s) => [s.category, s.title])).entries(),
            ].map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
      )}
      {loading && <Notice>Loading recent scores…</Notice>}
      {error && (
        <Notice error>
          {error}{" "}
          <button
            className="underline ms-2"
            onClick={() => setRetry(retry + 1)}
          >
            Try again
          </button>
        </Notice>
      )}
      {!loading && !error && !ranked.length && (
        <Notice>
          No published scores yet. Finish a quiz and choose “Publish casual
          score” to participate.
        </Notice>
      )}
      {!!ranked.length && (
        <div className="overflow-auto rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <table className="w-full text-start text-sm">
            <caption className="sr-only">Recent casual quiz scores</caption>
            <thead className="bg-brand text-white">
              <tr>
                {["Rank", "Player", "Quiz", "Score"].map((title) => (
                  <th key={title} scope="col" className="p-4 text-start">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((score, i) => (
                <tr
                  key={score.id}
                  className={`border-t border-gray-200 dark:border-gray-700 ${score.uid === app.user?.uid ? "bg-brand/10" : ""}`}
                >
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4 font-medium">{score.displayName}</td>
                  <td className="p-4">{score.title}</td>
                  <td className="p-4">
                    {score.score}/{score.total} (
                    {Math.round((score.score / score.total) * 100)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
