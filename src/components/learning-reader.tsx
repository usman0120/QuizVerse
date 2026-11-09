"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  draftKey,
  parseDraft,
  readDraftRaw,
  subscribeDrafts,
  writeDraft,
} from "@/lib/drafts";
import type { LearningCategory, LearningTopic } from "@/lib/types";
import { localDay } from "@/lib/quiz";
import { useApp } from "./provider";
import { Icon, Notice, shareText, Text } from "./ui";

interface Bookmark {
  categoryId: string;
  topicId: string;
  title: string;
}
interface Note extends Bookmark {
  text: string;
}
export function LearningReader({
  category,
  initialTopic,
}: {
  category: LearningCategory;
  initialTopic?: string;
}) {
  const app = useApp();
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState(
    category.topics.find((t) => t.id === initialTopic)?.id ||
      category.topics[0]?.id ||
      "",
  );
  const topic = category.topics.find((t) => t.id === selected);
  const filtered = category.topics.filter((t) =>
    `${t.name.en} ${t.name.ur || ""} ${t.content.en.replace(/<[^>]+>/g, " ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  function choose(id: string) {
    setSelected(id);
    setSaved(false);
    app.set(`recent:${category.id}:${id}`, {
      categoryId: category.id,
      topicId: id,
      title: category.topics.find((t) => t.id === id)?.name.en,
    });
    app.set(`activity:${localDay()}`, localDay());
  }
  const bookmarks = app.list<Bookmark>("bookmark:");
  const notes = app.list<Note>("note:");
  const recent = Object.entries(app.entries)
    .filter(([key, entry]) => key.startsWith("recent:") && !entry.deleted)
    .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
    .slice(0, 6)
    .map(([, entry]) => entry.value as Bookmark);
  return (
    <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[270px_1fr] gap-6 min-h-[70vh]">
      <aside className="panel self-start lg:sticky lg:top-24">
        <Link
          className="text-brand dark:text-secondary text-sm"
          href="/learning"
        >
          ← All learning categories
        </Link>
        <h1 className="text-xl font-bold my-4">
          <Text {...category.name} />
        </h1>
        <label className="text-sm">
          Search within category
          <input
            className="field mb-5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <h2 className="font-bold mb-2">Sections</h2>
        <nav
          aria-label="Learning sections"
          className="grid gap-1 max-h-80 overflow-auto"
        >
          {filtered.map((t) => (
            <button
              key={t.id}
              className={`text-start rounded-lg p-2 hover:bg-brand/10 ${selected === t.id && !saved ? "bg-brand text-white" : ""} ${t.parent ? "ms-4 text-sm" : ""}`}
              onClick={() => choose(t.id)}
            >
              <Text {...t.name} />
            </button>
          ))}
          {!filtered.length && <p className="text-sm">No matching topics.</p>}
        </nav>
        <h2 className="font-bold mt-6 mb-2">Recently viewed</h2>
        <div className="grid gap-2 text-sm">
          {recent.map((item, i) => (
            <Link
              key={i}
              href={`/learn?cat=${item.categoryId}&topic=${item.topicId}`}
            >
              {item.title}
            </Link>
          ))}
        </div>
        <button
          className="btn-secondary w-full mt-5"
          onClick={() => setSaved(!saved)}
        >
          <Icon name="bookmark" />
          {saved ? "Back to topic" : "Your saved content"}
        </button>
      </aside>
      {saved ? (
        <section className="panel">
          <h2 className="section-title">Your Saved Content</h2>
          <h3 className="font-bold mb-3">Bookmarks</h3>
          {!bookmarks.length && <p>No bookmarks yet.</p>}
          {bookmarks.map((b) => (
            <div
              className="flex justify-between gap-3 mb-3"
              key={`${b.categoryId}:${b.topicId}`}
            >
              <Link
                href={`/learn?cat=${b.categoryId}&topic=${b.topicId}`}
                className="text-brand dark:text-secondary"
              >
                {b.title}
              </Link>
              <button
                className="text-sm text-red-600 dark:text-red-300"
                onClick={() =>
                  app.set(`bookmark:${b.categoryId}:${b.topicId}`, null, true)
                }
              >
                Remove
              </button>
            </div>
          ))}
          <h3 className="font-bold mt-8 mb-3">Notes</h3>
          {!notes.length && <p>No notes yet.</p>}
          {notes.map((n) => (
            <article
              key={`${n.categoryId}:${n.topicId}`}
              className="bg-bgLight dark:bg-gray-700 p-4 mb-3 rounded-lg"
            >
              <Link
                className="font-bold"
                href={`/learn?cat=${n.categoryId}&topic=${n.topicId}`}
              >
                {n.title}
              </Link>
              <p className="whitespace-pre-wrap mt-2">{n.text}</p>
            </article>
          ))}
        </section>
      ) : topic ? (
        <LearningArticle key={topic.id} category={category} topic={topic} />
      ) : (
        <Notice>No learning content is available.</Notice>
      )}
    </div>
  );
}
function LearningArticle({
  category,
  topic,
}: {
  category: LearningCategory;
  topic: LearningTopic;
}) {
  const app = useApp();
  const contentRef = useRef<HTMLDivElement>(null);
  const key = `${category.id}:${topic.id}`;
  const note = app.get<Note | null>(`note:${key}`, null);
  const deviceDraftKey = draftKey(app.user?.uid, key);
  const draftRaw = useSyncExternalStore(
    subscribeDrafts,
    () => readDraftRaw(deviceDraftKey),
    () => null,
  );
  const savedDraft = parseDraft(draftRaw);
  const draft = savedDraft?.text ?? note?.text ?? "";
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const bookmarked = app.get<Bookmark | null>(`bookmark:${key}`, null);
  const highlights = app.get<string[]>(`highlight:${key}`, []);
  const language = app.settings.language;
  const content = topic.content[language] || topic.content.en;
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    root
      .querySelectorAll("mark[data-highlight]")
      .forEach((mark) =>
        mark.replaceWith(document.createTextNode(mark.textContent || "")),
      );
    root.normalize();
    for (const text of highlights) {
      if (!text) continue;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: globalThis.Text[] = [];
      let node;
      while ((node = walker.nextNode()))
        if (!node.parentElement?.closest("mark"))
          nodes.push(node as globalThis.Text);
      for (const textNode of nodes) {
        const parts = (textNode.textContent || "").split(text);
        if (parts.length < 2) continue;
        const fragment = document.createDocumentFragment();
        parts.forEach((part, i) => {
          if (i) {
            const mark = document.createElement("mark");
            mark.dataset.highlight = "true";
            mark.textContent = text;
            fragment.append(mark);
          }
          fragment.append(document.createTextNode(part));
        });
        textNode.replaceWith(fragment);
      }
    }
  }, [content, highlights]);
  function highlight() {
    const selection = window.getSelection();
    const selected = selection?.toString().trim();
    if (
      !selected ||
      !selection?.anchorNode ||
      !contentRef.current?.contains(selection.anchorNode) ||
      !selection.focusNode ||
      !contentRef.current.contains(selection.focusNode)
    ) {
      setMessage("Select text within this article first.");
      return;
    }
    if (selected.length > 500) {
      setMessage("Select a shorter passage (up to 500 characters).");
      return;
    }
    app.set(
      `highlight:${key}`,
      [...new Set([...highlights, selected])].slice(-50),
    );
    setMessage("Highlight saved.");
  }
  return (
    <article className="panel min-w-0">
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Text {...category.name} /> / <Text {...topic.name} />
          </p>
          <h2 className="text-2xl md:text-3xl font-bold">
            <Text {...topic.name} />
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="icon-btn"
            aria-label="Increase font size"
            onClick={() =>
              app.updateSettings({
                fontSize: Math.min(30, app.settings.fontSize + 2),
              })
            }
          >
            A+
          </button>
          <button
            className="icon-btn"
            aria-label="Decrease font size"
            onClick={() =>
              app.updateSettings({
                fontSize: Math.max(14, app.settings.fontSize - 2),
              })
            }
          >
            A−
          </button>
          <button
            className="icon-btn"
            aria-label="Highlight selected text"
            onMouseDown={(e) => e.preventDefault()}
            onClick={highlight}
          >
            <Icon name="highlighter" />
          </button>
          <button
            className="icon-btn"
            aria-label="Erase highlights"
            onClick={() => app.set(`highlight:${key}`, [])}
          >
            <Icon name="eraser" />
          </button>
        </div>
      </div>
      {language === "ur" && !topic.content.ur && (
        <Notice>
          Urdu translation is not available for this article. English content is
          shown.
        </Notice>
      )}
      <div
        ref={contentRef}
        style={{ fontSize: app.settings.fontSize }}
        className={`learning-content prose dark:prose-invert max-w-none ${language === "ur" && topic.content.ur ? "urdu" : ""}`}
        onErrorCapture={(event) => {
          const image = event.target;
          if (!(image instanceof HTMLImageElement) || image.dataset.failed)
            return;
          image.dataset.failed = "true";
          image.hidden = true;
          const fallback = document.createElement("span");
          fallback.className = "block rounded-lg bg-brand/10 p-4 text-sm";
          fallback.textContent = `${image.alt || "Article illustration"} — image unavailable`;
          image.after(fallback);
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className="flex flex-wrap gap-3 mt-8">
        <button
          className="btn-secondary"
          onClick={() =>
            app.set(
              `bookmark:${key}`,
              bookmarked
                ? null
                : {
                    categoryId: category.id,
                    topicId: topic.id,
                    title: topic.name.en,
                  },
              !!bookmarked,
            )
          }
        >
          <Icon name="bookmark" />
          {bookmarked ? "Remove bookmark" : "Bookmark"}
        </button>
        <Link
          className="btn"
          href={`/quiz?cat=${category.id.replaceAll("-", "_")}`}
        >
          <Icon name="question-circle" />
          Related quiz
        </Link>
        <button
          className="btn-secondary"
          onClick={() => {
            setEditing(!editing);
          }}
        >
          <Icon name="sticky-note" />
          Notes
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            void shareText(
              topic.name.en,
              `Read ${topic.name.en} on QuizVerse`,
              `${window.location.origin}/learn?cat=${category.id}&topic=${topic.id}`,
            )
              .then(() => setMessage("Shared or copied to clipboard."))
              .catch(() => setMessage("Sharing cancelled or unavailable."));
          }}
        >
          <Icon name="share-alt" />
          Share
        </button>
      </div>
      {topic.references?.length ? (
        <section className="mt-8">
          <h3 className="font-bold mb-3">References</h3>
          {topic.references.map((reference, i) => (
            <p key={i}>
              {reference.url?.startsWith("https://") ? (
                <a
                  className="text-brand dark:text-secondary underline"
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Text {...reference.title} />
                </a>
              ) : (
                <Text {...reference.title} />
              )}{" "}
              {reference.author}
            </p>
          ))}
        </section>
      ) : null}
      {editing && (
        <section className="mt-8">
          {savedDraft && (
            <Notice>
              Unsaved draft recovered on this device. Choose Save to sync it.
            </Notice>
          )}
          <label className="font-bold">
            Your notes
            <textarea
              className="field min-h-40 font-normal"
              disabled={!app.ready}
              value={draft}
              maxLength={10000}
              onChange={(e) => {
                const stored = writeDraft(deviceDraftKey, {
                  text: e.target.value,
                  baseUpdatedAt:
                    savedDraft?.baseUpdatedAt ??
                    app.entries[`note:${key}`]?.updatedAt ??
                    0,
                });
                if (!stored)
                  setMessage(
                    "Browser storage is full or blocked. This draft is kept in this tab only; save/export before closing or reloading.",
                  );
              }}
              placeholder="Write your thoughts about this topic…"
            />
          </label>
          <div className="flex gap-3 mt-3">
            <button
              className="btn"
              onClick={() => {
                const currentVersion =
                  app.entries[`note:${key}`]?.updatedAt || 0;
                if (
                  savedDraft &&
                  currentVersion > savedDraft.baseUpdatedAt &&
                  note?.text !== draft &&
                  !window.confirm(
                    "This note changed on another device or tab while you were editing. Your draft is safe here. Replace the saved version with this draft?",
                  )
                )
                  return;
                const saved = app.set(
                  `note:${key}`,
                  draft.trim()
                    ? {
                        categoryId: category.id,
                        topicId: topic.id,
                        title: topic.name.en,
                        text: draft,
                      }
                    : null,
                  !draft.trim(),
                );
                if (!saved) {
                  setMessage(
                    "Your account changed. The draft has been retained; sign in to the original account to save it.",
                  );
                  return;
                }
                writeDraft(deviceDraftKey, null);
                setEditing(false);
                setMessage(
                  "Notes saved on this device. Signed-in notes also sync to Firestore.",
                );
              }}
            >
              Save notes
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                writeDraft(deviceDraftKey, null);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </section>
      )}
      {message && <Notice>{message}</Notice>}
    </article>
  );
}
