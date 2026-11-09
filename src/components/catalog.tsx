"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuizCategory } from "@/lib/types";
import { useApp } from "./provider";
import { Icon, Notice, PageHeading, ContentText } from "./ui";

export function QuizCatalog({ categories }: { categories: QuizCategory[] }) {
  const { settings, ready } = useApp();
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("all");
  const filtered = categories.filter(
    (c) =>
      `${c.name.en} ${c.name.ur || ""} ${c.description.en} ${c.group}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!group || c.group === group) &&
      (!difficulty || c.difficulty === difficulty) &&
      (type === "all" || c.types.includes(type as "mcq")),
  );
  return (
    <div className="page">
      <PageHeading
        title="Quiz Categories"
        description="Find your next challenge. Choose a topic, question type, and difficulty."
      />
      <div className="panel mb-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label>
          Search
          <input
            className="field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Topics and keywords…"
          />
        </label>
        <label>
          Category
          <select
            className="field"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">All categories</option>
            {[...new Set(categories.map((c) => c.group))].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty
          <select
            className="field"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">All difficulties</option>
            {[...new Set(categories.map((c) => c.difficulty))].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Question type
          <select
            className="field"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="mcq">Multiple choice</option>
            <option value="true-false">True / False</option>
            <option value="fill-blanks">Fill in the blank</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-3 justify-between mb-6">
        <p aria-live="polite">{filtered.length} playable categories</p>
        <div className="flex gap-3">
          <button
            className="btn-secondary"
            onClick={() => {
              setSearch("");
              setGroup("");
              setDifficulty("");
              setType("all");
            }}
          >
            Reset filters
          </button>
          <Link
            className="btn"
            href={`/quiz?random=true&type=${type}${filtered.length ? `&cats=${filtered.map((c) => c.id).join(",")}` : ""}`}
          >
            <Icon name="random" />
            Random Quiz
          </Link>
        </div>
      </div>
      {!filtered.length && (
        <Notice>
          No categories match these filters. Try a broader search.
        </Notice>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((c) => (
          <article
            className="panel flex flex-col hover:shadow-lg transition-shadow"
            key={c.id}
            style={{ borderTop: `4px solid ${c.color}` }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${c.color}15`, color: c.color }}
            >
              <Icon name={c.icon} className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              <ContentText {...c.name} />
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">
              <ContentText {...c.description} />
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {c.count} unique questions · {c.difficulty}
            </p>
            <Link
              className="btn"
              href={`/quiz?cat=${c.id}&type=${type}&lang=${settings.language}`}
              aria-disabled={!ready}
            >
              Start Quiz
              <Icon name="arrow-right" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
