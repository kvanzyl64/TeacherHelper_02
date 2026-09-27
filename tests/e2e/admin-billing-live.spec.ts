import { expect, test } from "@playwright/test";
import { expectAdminNavigation, hasAdminTestCredentials } from "./admin-helpers";

test.describe("live SaaS billing", () => {
  test.skip(!hasAdminTestCredentials, "Platform admin E2E credentials are not configured.");

  test("shows subscription billing without family tuition records", async ({ page }) => {
    await expectAdminNavigation(page, "/admin/billing");
    await expect(page.getByRole("heading", { name: /Billing overview|Billing unavailable/ })).toBeVisible();
    await expect(page.getByText("Monthly recurring revenue")).toBeVisible();
    await expect(page.getByText(/family|student|learner|invoice/i)).toHaveCount(0);
  });

  test("denies a non-owner session through the generic admin boundary", async ({ page }) => {
    await page.goto("/admin/billing");
    await expect(page).not.toHaveURL(/admin\/billing$/);
  });
});
