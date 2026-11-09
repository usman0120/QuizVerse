import { test, expect } from "@playwright/test";

test("random quiz footer shortcut starts the correct quiz mode", async ({
  page,
}) => {
  await page.goto("/quiz");
  await page.getByRole("button", { name: "Start Quiz", exact: true }).click();
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Random Quiz", exact: true })
    .click();
  await expect(page).toHaveURL(/random=true/);
  await expect(
    page.getByRole("heading", { name: "Random Quiz", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start Quiz", exact: true }),
  ).toBeEnabled();
});
