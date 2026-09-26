import { expect, test } from "@playwright/test";

test.describe("public home page", () => {
  test("exposes intentional entry links and in-page sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /make every lesson feel connected/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" }).first()).toHaveAttribute("href", "/auth/login");
    await expect(page.getByRole("link", { name: /start free/i })).toHaveAttribute("href", "/onboarding");
    await expect(page.getByRole("link", { name: /create your centre/i }).first()).toHaveAttribute("href", "/onboarding");

    await page.getByRole("link", { name: "How it works" }).first().click();
    await expect(page).toHaveURL(/#workflow$/);
    await expect(page.locator("#workflow")).toBeVisible();

    await page.getByRole("link", { name: "Trust and privacy" }).first().click();
    await expect(page).toHaveURL(/#trust$/);
    await expect(page.locator("#trust")).toBeVisible();
  });
});