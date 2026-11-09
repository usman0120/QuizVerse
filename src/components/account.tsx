"use client";

import Link from "next/link";
import { useState } from "react";
import { sendEmailVerification, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { firebaseServices, friendlyError } from "@/lib/firebase";
import { storageKey } from "@/lib/progress";
import { calculateStreak } from "@/lib/quiz";
import type { Profile, QuizResult } from "@/lib/types";
import { useApp } from "./provider";
import { downloadText, Icon, Modal, Notice, PageHeading } from "./ui";

export function Account() {
  const app = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(app.profile);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const results = app
    .list<QuizResult>("result:")
    .sort((a, b) => b.date.localeCompare(a.date));
  const streak = calculateStreak(app.list<string>("activity:"));
  async function logout() {
    if (
      app.sync !== "Synced" &&
      !window.confirm(
        "Cloud changes may not be synced. Export your data first. Signing out clears this account's device cache and could discard pending changes. Continue?",
      )
    )
      return;
    setBusy(true);
    const uid = app.user?.uid;
    try {
      await signOut(firebaseServices().auth);
      if (uid) localStorage.removeItem(storageKey(uid));
      setMessage(
        "Signed out. Your account cache was removed from this device. Cloud progress is retained.",
      );
    } catch (e) {
      setMessage(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  async function removePublished() {
    if (!app.user) return;
    const { db } = firebaseServices();
    // Chunked deletes avoid the Firestore write limit and remove all of this user's submissions.
    while (true) {
      const snapshot = await getDocs(
        query(
          collection(db, "quizverse_scores"),
          where("uid", "==", app.user.uid),
          limit(100),
        ),
      );
      if (snapshot.empty) break;
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }
  return (
    <div className="page max-w-5xl">
      <PageHeading
        title={{
          en: "Your Profile & Progress",
          ur: "آپ کی پروفائل اور پیش رفت",
        }}
      />
      {!app.ready && <Notice>Loading your profile…</Notice>}
      <section className="panel mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-brand/10 text-brand dark:text-secondary flex items-center justify-center">
              <Icon name="user" className="text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{app.profile.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {app.user?.email || "Guest profile · local to this device"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn"
              disabled={!app.ready}
              onClick={() => {
                setDraft(app.profile);
                setEditing(true);
              }}
            >
              Edit Profile
            </button>
            {app.user ? (
              <button
                className="btn-secondary"
                disabled={busy}
                onClick={() => {
                  void logout();
                }}
              >
                Sign Out
              </button>
            ) : (
              <Link className="btn-accent" href="/auth">
                Sign in to sync
              </Link>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            ["Country", app.profile.country],
            ["Age", app.profile.age],
            ["Level", app.profile.level],
            ["Gender", app.profile.gender],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-bgLight dark:bg-gray-700 rounded-lg p-3"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <p className="font-medium capitalize">
                {value || "Not provided"}
              </p>
            </div>
          ))}
        </div>
        <Notice>{app.sync}</Notice>
        {app.error && (
          <Notice error>
            {app.error}{" "}
            <button className="underline ms-2" onClick={app.retrySync}>
              Retry sync
            </button>
          </Notice>
        )}
        {app.user && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Guest progress is not imported automatically, so another person’s
              data on a shared device stays separate.
            </p>
            <button
              className="btn-secondary mt-4"
              onClick={() => {
                if (
                  window.confirm(
                    "Import guest progress from this device into your account? Existing account records will not be overwritten.",
                  )
                ) {
                  app.importGuest();
                  setMessage(
                    "Guest records imported. Cloud sync will upload them when connected.",
                  );
                }
              }}
            >
              Import Guest Progress
            </button>
            {!app.user.emailVerified && (
              <Notice>
                Your email is not verified.{" "}
                <button
                  className="underline"
                  onClick={() => {
                    void sendEmailVerification(app.user!)
                      .then(() =>
                        setMessage(
                          "Verification email sent. Check your inbox.",
                        ),
                      )
                      .catch((e) => setMessage(friendlyError(e)));
                  }}
                >
                  Send verification email
                </button>
              </Notice>
            )}
          </>
        )}
      </section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          [results.length, "Quizzes completed"],
          [results.reduce((n, r) => n + r.score, 0), "Correct answers"],
          [streak, "Day streak"],
          [app.list("bookmark:").length, "Bookmarks"],
        ].map(([value, label]) => (
          <div className="panel text-center" key={label}>
            <p className="text-3xl text-brand dark:text-secondary font-bold mb-2">
              {value}
            </p>
            <p className="text-sm">{label}</p>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="flex flex-wrap justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold">Quiz History</h2>
          <button
            className="btn-secondary"
            onClick={() =>
              downloadText(
                "quizverse-progress.json",
                JSON.stringify(
                  {
                    exportedAt: new Date().toISOString(),
                    entries: app.entries,
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            <Icon name="download" />
            Export Your Data
          </button>
        </div>
        {!results.length && (
          <p className="text-gray-500 dark:text-gray-400">
            No completed quizzes yet.{" "}
            <Link
              href="/quizzes"
              className="text-brand dark:text-secondary underline"
            >
              Take your first quiz
            </Link>
            .
          </p>
        )}
        <div className="grid gap-3">
          {results.slice(0, 100).map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1fr_auto] gap-4 items-center bg-bgLight dark:bg-gray-700 rounded-lg p-4"
            >
              <div>
                <h3 className="font-bold">{r.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(r.date).toLocaleDateString()} · {r.seconds}s
                </p>
              </div>
              <p className="text-xl text-brand dark:text-secondary font-bold">
                {r.score}/{r.total}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel mt-8">
        <h2 className="text-xl font-bold mb-4">Data controls</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Clearing progress removes quiz history, notes, bookmarks, highlights,
          and flashcard records. Empty deletion markers are retained for
          cross-device consistency. Profile and settings are kept.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-secondary text-red-700 dark:text-red-300"
            disabled={!app.ready || busy}
            onClick={() => {
              if (
                !window.confirm(
                  "Clear all saved learning and quiz progress? Export your data first if needed.",
                )
              )
                return;
              for (const key of Object.keys(app.entries))
                if (!["profile", "settings"].includes(key))
                  app.set(key, null, true);
              setMessage(
                "Progress cleared locally. Deletion markers sync when connected; published scores are managed separately.",
              );
            }}
          >
            Clear Saved Progress
          </button>
          {app.user && (
            <button
              className="btn-secondary text-red-700 dark:text-red-300"
              disabled={busy}
              onClick={() => {
                if (
                  !window.confirm(
                    "Remove all your published casual scores from the leaderboard?",
                  )
                )
                  return;
                setBusy(true);
                void removePublished()
                  .then(() =>
                    setMessage("Your published scores have been removed."),
                  )
                  .catch((e) => setMessage(friendlyError(e)))
                  .finally(() => setBusy(false));
              }}
            >
              Remove Published Scores
            </button>
          )}
        </div>
      </section>
      {!!Object.keys(app.entries).some((k) => k.startsWith("legacy")) && (
        <Notice>
          Older browser records were preserved in your data export. Recognized
          records are migrated to the new system; records whose old format is
          ambiguous remain in the export rather than being guessed or discarded.
        </Notice>
      )}
      {message && <Notice>{message}</Notice>}
      {editing && (
        <Modal title="Edit Your Profile" onClose={() => setEditing(false)}>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              app.set("profile", draft);
              setEditing(false);
              setMessage("Profile saved.");
            }}
          >
            <label>
              Name
              <input
                className="field"
                required
                minLength={2}
                maxLength={60}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              Country (optional)
              <input
                className="field"
                maxLength={60}
                autoComplete="country-name"
                value={draft.country}
                onChange={(e) =>
                  setDraft({ ...draft, country: e.target.value })
                }
              />
            </label>
            <label>
              Age (optional)
              <input
                className="field"
                type="number"
                min={5}
                max={120}
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: e.target.value })}
              />
            </label>
            <label>
              Education level (optional)
              <select
                className="field"
                value={draft.level}
                onChange={(e) => setDraft({ ...draft, level: e.target.value })}
              >
                <option value="">Not provided</option>
                {[
                  "primary",
                  "middle",
                  "high-school",
                  "college",
                  "university",
                  "professional",
                ].map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>
            <label>
              Gender (optional)
              <select
                className="field"
                value={draft.gender}
                onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
              >
                <option value="">Not provided</option>
                {["male", "female", "other", "prefer-not"].map((gender) => (
                  <option key={gender}>{gender}</option>
                ))}
              </select>
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your display name is used only if you choose to publish a quiz
              result. Other profile fields remain private.
            </p>
            <button className="btn">Save Profile</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
