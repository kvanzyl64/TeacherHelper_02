import { expect, test } from "@playwright/test";
import { expectAdminNavigation, hasAdminTestCredentials } from "./admin-helpers";

test.describe("platform admin authentication", () => {
  test("redirects anonymous visitors to sign in", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole("heading", { name: /sign in to teacher helper/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("signs an active platform owner in with application credentials", async ({ page }) => {
    test.skip(!hasAdminTestCredentials, "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required.");

    await expectAdminNavigation(page, "/admin");
    await expect(page).toHaveURL(/\/admin$/);
  });
});
