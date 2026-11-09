"use client";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "./provider";
import { clearScopeDrafts } from "@/lib/drafts";
import { Notice } from "./ui";
const legacyKeys = [
  "quizverse_profile",
  "quizverse_profile_skipped",
  "quizverse_stats",
  "quizverse_user_id",
  "userNotes",
  "bookmarks",
  "highlightedText",
  "recentTopics",
  "learnedCards",
  "difficultCards",
  "favoriteQuotes",
  "quizHistory",
  "personalityQuizHistory",
  "flashcardStreak",
  "lastStudyDate",
  "totalStudyTime",
];
export function StorageControls() {
  const app = useApp();
  const [message, setMessage] = useState("");
  return (
    <div className="panel">
      <h2 className="text-xl font-bold mb-4">Your Browser Storage</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        QuizVerse uses browser storage for your authentication session, theme,
        language, and progress. It does not add analytics or advertising
        cookies. Clearing guest data affects only QuizVerse records, not other
        applications or Firebase sign-in.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-secondary"
          disabled={!!app.user || !app.ready}
          onClick={() => {
            if (
              !window.confirm(
                "Clear QuizVerse guest progress, profile, and legacy records on this device? Export important data first.",
              )
            )
              return;
            Object.keys(app.entries)
              .filter((k) => k !== "settings")
              .forEach((k) => app.set(k, null, true));
            clearScopeDrafts();
            try {
              legacyKeys.forEach((key) => localStorage.removeItem(key));
              setMessage(
                "QuizVerse guest data cleared. Theme and language settings are kept.",
              );
            } catch {
              setMessage(
                "Browser storage could not be cleared. Check your browser permissions.",
              );
            }
          }}
        >
          Clear Guest Data
        </button>
        <Link href="/account" className="btn">
          Manage Account Data
        </Link>
      </div>
      {app.user && (
        <Notice>
          Sign out first to clear guest data. Account progress is managed from
          your profile.
        </Notice>
      )}
      {message && <Notice>{message}</Notice>}
    </div>
  );
}
