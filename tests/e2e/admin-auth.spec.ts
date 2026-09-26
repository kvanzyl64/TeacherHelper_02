import { expect, test } from "@playwright/test";

test.describe("platform admin authentication", () => {
  test("redirects anonymous visitors to sign in", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
});
