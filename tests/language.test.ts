import { test } from "node:test";
import assert from "node:assert/strict";
import { contentLocale } from "../src/lib/language";
import { footerGroups } from "../src/lib/navigation";

test("content locale scopes Urdu without changing English content", () => {
  assert.deepEqual(contentLocale("Question", "سوال", "ur"), {
    text: "سوال",
    lang: "ur",
    dir: "rtl",
  });
  assert.deepEqual(contentLocale("Question", "سوال", "en"), {
    text: "Question",
    lang: "en",
    dir: "ltr",
  });
});
test("missing translations remain accurately tagged as English", () => {
  assert.deepEqual(contentLocale("Question", undefined, "ur"), {
    text: "Question",
    lang: "en",
    dir: "ltr",
  });
  assert.equal(contentLocale("Question", "   ", "ur").lang, "en");
});
test("footer covers every active public page and excludes retired modules", () => {
  const links: string[] = footerGroups.flatMap((group) =>
    group.links.map(([href]) => href),
  );
  for (const route of [
    "/",
    "/quizzes",
    "/quiz",
    "/personality",
    "/leaderboard",
    "/auth",
    "/account",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ])
    assert.ok(links.includes(route), route);
  assert.equal(
    links.some(
      (href) =>
        href.startsWith("/flashcards") ||
        href.startsWith("/learning") ||
        href.startsWith("/learn?"),
    ),
    false,
  );
});
