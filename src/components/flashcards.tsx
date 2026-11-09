"use client";

import { useEffect, useState } from "react";
import { calculateStreak, localDay, shuffle } from "@/lib/quiz";
import type { CardProgress, Deck } from "@/lib/types";
import { useApp } from "./provider";
import { celebrate, Icon, Media, Notice, PageHeading } from "./ui";

export function Flashcards({ decks }: { decks: Deck[] }) {
  const app = useApp();
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Deck | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"text" | "image" | "mixed">("mixed");
  const [order, setOrder] = useState(decks);
  const [dueOnly, setDueOnly] = useState(false);
  const allProgress = Object.entries(app.entries)
    .filter(([key, entry]) => key.startsWith("card:") && !entry.deleted)
    .map(([, entry]) => entry.value as CardProgress);
  const learned = allProgress.filter((p) => p.learned).length;
  const streak = calculateStreak(app.list<string>("activity:"));
  const seconds = app.list<number>("study:").reduce((a, b) => a + b, 0);
  const filtered = order.filter(
    (d) =>
      `${d.title} ${d.tags.join(" ")} ${d.description}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!group || d.group === group) &&
      (!category || d.category === category),
  );
  const card = selected?.cards[index];
  const progress = card
    ? app.get<CardProgress | null>(`card:${card.id}`, null)
    : null;
  const selectedId = selected?.id;
  const recordStudy = app.recordStudy;
  useEffect(() => {
    if (!selectedId) return;
    let pending = 0;
    let last = performance.now();
    let running = !document.hidden;
    const save = () => {
      const now = performance.now();
      if (running) pending += (now - last) / 1000;
      last = now;
      const seconds = Math.floor(pending);
      if (seconds > 0) {
        recordStudy(seconds);
        pending -= seconds;
      }
    };
    const visibility = () => {
      save();
      running = !document.hidden;
    };
    const interval = setInterval(save, 30000);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", save);
    return () => {
      clearInterval(interval);
      save();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", save);
    };
  }, [selectedId, recordStudy]);
  function open(deck: Deck) {
    const cards = dueOnly
      ? deck.cards.filter((c) => {
          const p = app.get<CardProgress | null>(`card:${c.id}`, null);
          return !p || Date.parse(p.dueAt) <= Date.now();
        })
      : deck.cards;
    setSelected({ ...deck, cards });
    setIndex(0);
    setFlipped(false);
  }
  function mark(learned: boolean, difficult: boolean) {
    if (!card) return;
    const now = new Date();
    app.set(`card:${card.id}`, {
      learned,
      difficult,
      reviewedAt: now.toISOString(),
      dueAt: new Date(
        now.getTime() + (difficult ? 1 : learned ? 7 : 0) * 86400000,
      ).toISOString(),
    } satisfies CardProgress);
    app.set(`activity:${localDay()}`, localDay());
    if (learned && !progress?.learned) void celebrate();
  }
  const complete = decks.filter((d) =>
    d.cards.every(
      (c) => app.get<CardProgress | null>(`card:${c.id}`, null)?.learned,
    ),
  ).length;
  return (
    <>
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-brand/5 to-secondary/10 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-10">
          <div>
            <span className="text-brand dark:text-secondary font-medium">
              Smart learning, one card at a time
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mt-4 mb-6">
              Master Anything with{" "}
              <span className="text-brand dark:text-secondary">Flashcards</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Turn information into lasting knowledge. Flip, practice, and track
              what you’ve learned.
            </p>
            <a className="btn-accent" href="#decks">
              Start Learning →
            </a>
          </div>
          <button
            className="panel min-h-64 text-center bg-gradient-to-r from-brand to-secondary text-white"
            onClick={(e) => {
              e.currentTarget
                .querySelector("[data-answer]")
                ?.classList.toggle("hidden");
            }}
          >
            <Icon name="brain" className="text-5xl text-accent mb-5" />
            <p className="text-xl font-bold">
              What is the powerhouse of the cell?
            </p>
            <p data-answer className="hidden text-2xl font-bold mt-5">
              Mitochondria
            </p>
            <p className="text-sm mt-5 opacity-80">Tap to reveal the answer</p>
          </button>
        </div>
      </section>
      <div className="page" id="decks">
        {selected ? (
          <>
            <div className="flex flex-wrap gap-3 justify-between mb-8">
              <div>
                <h2 className="section-title">{selected.title}</h2>
                <p>
                  {selected.category} · {selected.group}
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelected({
                      ...selected,
                      cards: shuffle(selected.cards),
                    });
                    setIndex(0);
                    setFlipped(false);
                  }}
                >
                  <Icon name="random" />
                  Shuffle
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setSelected(null)}
                >
                  Back to decks
                </button>
              </div>
            </div>
            {!card ? (
              <Notice>
                All cards in this deck have been reviewed. Turn off “Due cards
                only” to study all cards.
              </Notice>
            ) : (
              <>
                <div className="panel max-w-3xl mx-auto mb-6">
                  <div className="flex justify-between mb-3">
                    <p>
                      Card {index + 1}/{selected.cards.length}
                    </p>
                    <p>
                      {
                        selected.cards.filter(
                          (c) =>
                            app.get<CardProgress | null>(`card:${c.id}`, null)
                              ?.learned,
                        ).length
                      }{" "}
                      learned
                    </p>
                  </div>
                  <label>
                    Display mode
                    <select
                      className="field"
                      value={mode}
                      onChange={(e) => setMode(e.target.value as typeof mode)}
                    >
                      <option value="text">Text Only</option>
                      <option value="image">Image + Answer</option>
                      <option value="mixed">Text + Image</option>
                    </select>
                  </label>
                </div>
                <button
                  className="flip-card block w-full max-w-3xl mx-auto text-center"
                  aria-label={
                    flipped ? "Show question" : "Flip card to reveal answer"
                  }
                  aria-pressed={flipped}
                  onClick={() => setFlipped(!flipped)}
                >
                  <div
                    className={`flip-inner h-[420px] ${flipped ? "flipped" : ""}`}
                  >
                    <div
                      aria-hidden={flipped}
                      className="flip-face panel absolute inset-0 flex flex-col justify-center items-center overflow-auto"
                    >
                      {mode !== "text" && card.image && (
                        <Media
                          key={card.image}
                          src={card.image}
                          alt="Flashcard illustration"
                          className="h-44 w-full object-contain mb-4"
                        />
                      )}
                      {(mode !== "image" || !card.image) && (
                        <p className="text-2xl font-bold">{card.front}</p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 mt-5 text-sm">
                        Tap or press Enter to flip
                      </p>
                    </div>
                    <div
                      aria-hidden={!flipped}
                      className="flip-face flip-back panel absolute inset-0 bg-gradient-to-r from-brand to-secondary text-white flex flex-col justify-center overflow-auto"
                    >
                      <p className="text-2xl font-bold mb-4">{card.back}</p>
                      {card.example && (
                        <p className="mb-3">Example: {card.example}</p>
                      )}
                      {card.mnemonic && (
                        <p className="text-sm">Memory tip: {card.mnemonic}</p>
                      )}
                      {card.reference && (
                        <p className="text-xs opacity-80 mt-3">
                          {card.reference}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <button
                    className="btn-secondary"
                    disabled={!flipped}
                    onClick={() => mark(false, !progress?.difficult)}
                  >
                    <Icon name="exclamation-circle" />
                    {progress?.difficult
                      ? "Unmark Difficult"
                      : "Mark Difficult"}
                  </button>
                  <button
                    className="btn"
                    disabled={!flipped}
                    onClick={() => mark(!progress?.learned, false)}
                  >
                    <Icon name="check" />
                    {progress?.learned ? "Mark Unlearned" : "Mark Learned"}
                  </button>
                </div>
                {card.hint && (
                  <details className="max-w-3xl mx-auto mt-4">
                    <summary className="cursor-pointer">Hint</summary>
                    <p className="mt-2">{card.hint}</p>
                  </details>
                )}
                <div className="flex justify-between max-w-3xl mx-auto mt-6">
                  <button
                    className="btn-secondary"
                    disabled={index === 0}
                    onClick={() => {
                      setIndex(index - 1);
                      setFlipped(false);
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn-secondary"
                    disabled={index + 1 >= selected.cards.length}
                    onClick={() => {
                      setIndex(index + 1);
                      setFlipped(false);
                    }}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <PageHeading
              title={{
                en: "Featured Flashcard Decks",
                ur: "فلیش کارڈز کے مجموعے",
              }}
            />
            <div className="panel grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <label>
                Search decks
                <input
                  className="field"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label>
                Age group
                <select
                  className="field"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                >
                  <option value="">All groups</option>
                  {[...new Set(decks.map((d) => d.group))].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label>
                Category
                <select
                  className="field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All categories</option>
                  {[...new Set(decks.map((d) => d.category))].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3">
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={dueOnly}
                    onChange={(e) => setDueOnly(e.target.checked)}
                  />
                  Due cards only
                </label>
                <button
                  className="btn-secondary"
                  onClick={() => setOrder(shuffle(decks))}
                >
                  <Icon name="random" />
                  Shuffle decks
                </button>
              </div>
            </div>
            {!filtered.length && <Notice>No decks match your filters.</Notice>}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((d) => {
                const learned = d.cards.filter(
                  (c) =>
                    app.get<CardProgress | null>(`card:${c.id}`, null)?.learned,
                ).length;
                return (
                  <article key={d.id} className="panel flex flex-col">
                    <div className="flex justify-between text-sm text-brand dark:text-secondary mb-4">
                      <span>{d.category}</span>
                      <span>{d.difficulty}</span>
                    </div>
                    <h2 className="text-xl font-bold font-heading mb-3">
                      {d.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">
                      {d.description}
                    </p>
                    <p className="text-sm mb-3">
                      {d.cards.length} cards · {d.group} · {learned} learned
                    </p>
                    <progress
                      aria-label={`${d.title} progress`}
                      className="w-full h-2 mb-4 accent-brand"
                      value={learned}
                      max={d.cards.length}
                    />
                    <button
                      className="btn"
                      onClick={() => open(d)}
                      disabled={!app.ready}
                    >
                      Study Now →
                    </button>
                  </article>
                );
              })}
            </div>
          </>
        )}
        <section className="mt-16" id="progress">
          <h2 className="section-title text-center mb-8">
            Learning Statistics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              [learned, "Cards learned"],
              [streak, "Day streak"],
              [complete, "Decks completed"],
              [Math.floor(seconds / 60), "Minutes studied"],
            ].map(([value, label]) => (
              <div className="panel text-center" key={label}>
                <p className="text-4xl text-brand dark:text-secondary font-bold mb-3">
                  {value}
                </p>
                <p>{label}</p>
              </div>
            ))}
          </div>
          <div className="panel mt-6">
            <h3 className="font-bold mb-5">Learning Progress</h3>
            <div className="grid gap-4">
              {decks.map((d) => (
                <div key={d.id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{d.title}</span>
                    <span>
                      {
                        d.cards.filter(
                          (c) =>
                            app.get<CardProgress | null>(`card:${c.id}`, null)
                              ?.learned,
                        ).length
                      }
                      /{d.cards.length}
                    </span>
                  </div>
                  <progress
                    aria-label={`${d.title} learning progress`}
                    className="w-full h-2 accent-brand"
                    max={d.cards.length}
                    value={
                      d.cards.filter(
                        (c) =>
                          app.get<CardProgress | null>(`card:${c.id}`, null)
                            ?.learned,
                      ).length
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
