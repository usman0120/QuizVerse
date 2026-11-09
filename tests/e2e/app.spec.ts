import { test, expect } from "@playwright/test";
test("unsaved notes survive topic changes and reload without being auto-published", async ({
  page,
}) => {
  await page.goto("/learn?cat=science-nature&topic=intro");
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByLabel("Your notes").fill("Recover this unsaved draft.");
  await page
    .getByRole("navigation", { name: "Learning sections" })
    .getByRole("button", { name: "Physics Basics", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Learning sections" })
    .getByRole("button", { name: "Introduction", exact: true })
    .click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.getByLabel("Your notes")).toHaveValue(
    "Recover this unsaved draft.",
  );
  await page.reload();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.getByLabel("Your notes")).toHaveValue(
    "Recover this unsaved draft.",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("quizverse:v2:guest") || "{}")[
          "note:science-nature:intro"
        ],
    ),
  ).toBeUndefined();
  await page.getByRole("button", { name: "Save notes" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.getByLabel("Your notes")).toHaveValue(
    "Recover this unsaved draft.",
  );
});
test("new logo renders, favicon matches, and clock endpoint is uncached", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const logo = page
    .getByRole("link", { name: "QuizVerse home" })
    .locator("img");
  await expect(logo).toHaveAttribute("src", "/brand/quizverse-mark.svg");
  await expect(logo).toBeVisible();
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
    "href",
    /quizverse-mark\.svg/,
  );
  await page.setViewportSize({ width: 360, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.screenshot({
    path: test.info().outputPath("quizverse-logo-mobile.png"),
  });
  const time = await request.get("/api/time");
  expect(time.status()).toBe(200);
  expect(time.headers()["cache-control"]).toContain("no-store");
  expect(Math.abs((await time.json()).serverTime - Date.now())).toBeLessThan(
    10000,
  );
});
test("a malformed cache entry cannot crash the profile page or expose stored passwords", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "quizverse:v2:guest",
      JSON.stringify({
        malformed: "invalid",
        profile: {
          updatedAt: 1,
          value: { name: "Safe Learner", password: "must-be-stripped" },
        },
        "result:broken": { updatedAt: 2, value: null },
      }),
    );
  });
  await page.goto("/account");
  await expect(
    page.getByRole("heading", { name: "Safe Learner", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("quizverse:v2:guest")),
  ).not.toContain("must-be-stripped");
});
test("timed quiz expires once and keeps a usable Next action", async ({
  page,
}) => {
  await page.goto("/quiz?cat=general_knowledge&type=true-false");
  await expect(page.getByRole("button", { name: "Start Quiz" })).toBeEnabled();
  await page.clock.install();
  await page.getByRole("button", { name: "Start Quiz" }).click();
  await page.clock.fastForward(121000);
  await expect(
    page.getByText("Question skipped", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next", exact: false }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Next", exact: false }).click();
  await expect(
    page.getByRole("button", { name: "True", exact: true }),
  ).toBeEnabled();
});
test("fill blanks retain the supported question type and accept correct text", async ({
  page,
}) => {
  await page.goto("/quiz?cat=general_knowledge&type=fill-blanks");
  await page.getByRole("checkbox", { name: "Timed mode" }).uncheck();
  await page.getByRole("button", { name: "Start Quiz" }).click();
  const question = await page.locator("h2").first().textContent();
  const answer = question?.includes("gold")
    ? "Au"
    : question?.includes("ocean")
      ? "Pacific"
      : question?.includes("plants")
        ? "photosynthesis"
        : question?.includes("Pakistan")
          ? "Islamabad"
          : "H2O";
  await page.getByLabel("Your answer").fill(`  ${answer.toUpperCase()}  `);
  await page.getByRole("button", { name: "Submit Answer" }).click();
  await expect(page.getByText("Correct!", { exact: true })).toBeVisible();
});
test("unavailable categories explain the problem and auth UI does not save passwords", async ({
  page,
}) => {
  await page.goto("/quiz?cat=not-real");
  await expect(
    page.getByRole("status").filter({
      hasText: "No questions are available for this category or question type.",
    }),
  ).toBeVisible();
  await page.goto("/auth");
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("never-store-this");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "never-store-this",
  );
  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page.getByLabel("Display name")).toBeVisible();
});
test("homepage design, working CTA, and mobile navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Test Your Knowledge/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Start Quiz Now" }).first().click();
  await expect(page).toHaveURL(/\/quizzes/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Learning Hub" })
    .click();
  await expect(page).toHaveURL(/\/learning/);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
});
test("quiz answers are single-shot, complete, and persist in guest history", async ({
  page,
}) => {
  await page.goto("/quiz?cat=general_knowledge&type=true-false");
  await page.getByRole("checkbox", { name: "Timed mode" }).uncheck();
  await page.getByRole("button", { name: "Start Quiz" }).click();
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "True", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "True", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("button", {
        name: i === 9 ? "See Results" : "Next",
        exact: false,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Quiz Completed!" }),
  ).toBeVisible();
  await page.goto("/account");
  await expect(
    page.getByRole("heading", { name: "General Knowledge", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "General Knowledge", exact: true }),
  ).toBeVisible();
});
test("theme and Urdu persist across routes and reload", async ({ page }) => {
  await page.goto("/quizzes");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to Urdu" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.goto("/learning");
  await expect(page.locator("html")).toHaveAttribute("lang", "ur");
  await expect(page.locator("html")).toHaveClass(/dark/);
});
test("learning notes and bookmarks survive reload", async ({ page }) => {
  await page.goto("/learn?cat=science-nature&topic=intro");
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByLabel("Your notes").fill("A useful study note.");
  await page.getByRole("button", { name: "Save notes" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove bookmark" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.getByLabel("Your notes")).toHaveValue(
    "A useful study note.",
  );
});
test("flashcard mastery uses stable IDs even after shuffle", async ({
  page,
}) => {
  await page.goto("/flashcards");
  await page.getByRole("button", { name: "Study Now" }).first().click();
  await page
    .getByRole("button", { name: "Flip card to reveal answer" })
    .click();
  await page.getByRole("button", { name: "Mark Learned", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mark Unlearned" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to decks" }).click();
  await page.reload();
  await expect(page.getByText("3 cards · Students · 1 learned")).toBeVisible();
});
test("personality previous answers can be changed without duplicate scoring", async ({
  page,
}) => {
  await page.goto("/personality");
  await page.getByRole("button", { name: "Start Quiz" }).first().click();
  await page.locator(".answer").first().click();
  await page.getByRole("button", { name: "Next", exact: false }).click();
  await page.getByRole("button", { name: "Previous", exact: false }).click();
  await page.locator(".answer").nth(1).click();
  while (
    await page.getByRole("button", { name: "Next", exact: false }).count()
  ) {
    await page.locator(".answer").first().click();
    await page.getByRole("button", { name: "Next", exact: false }).click();
  }
  await page.locator(".answer").first().click();
  await page.getByRole("button", { name: "See Results" }).click();
  await expect(page.getByRole("button", { name: "Retake Quiz" })).toBeVisible();
});
test("old URLs keep queries, contact redirects, and unavailable content fails gracefully", async ({
  request,
}) => {
  const old = await request.get("/quiz.html?cat=biology", { maxRedirects: 0 });
  expect(old.status()).toBe(308);
  expect(old.headers().location).toContain("/quiz?cat=biology");
  const contact = await request.get("/contact", { maxRedirects: 0 });
  expect(contact.headers().location).toBe(
    "https://usman-portfolio-silk.vercel.app/contact",
  );
  const legacyLearn = await request.get("/learn?topic=islamic-studies");
  expect(legacyLearn.status()).toBe(200);
  expect(await legacyLearn.text()).toContain("Quran Studies");
  const unknown = await request.get("/learn?cat=not-real");
  // Next returns 200 if the loading boundary has already begun streaming.
  expect([200, 404]).toContain(unknown.status());
  const missingHtml = await unknown.text();
  expect(missingHtml).toContain("Page not found");
  expect(missingHtml).toMatch(/name="robots" content="noindex"/);
});
