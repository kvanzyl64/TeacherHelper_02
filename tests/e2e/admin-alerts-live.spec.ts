import { expect, test } from "@playwright/test";
import { expectAdminNavigation, hasAdminTestCredentials } from "./admin-helpers";

test.describe("live platform alerts", () => {
  test.skip(!hasAdminTestCredentials, "Platform admin E2E credentials are not configured.");

  test("shows safe alert queue states and recovery context", async ({ page }) => {
    await expectAdminNavigation(page, "/admin/alerts");
    await expect(page.getByRole("heading", { name: /Operational alerts|Alerts unavailable/ })).toBeVisible();
    await expect(page.getByText(/Open alerts|No open alerts/)).toBeVisible();
    await expect(page.getByText(/student|guardian|session|resource|consent/i)).toHaveCount(0);
  });

  test("keeps non-owner access behind the generic admin boundary", async ({ page }) => {
    await page.goto("/admin/alerts");
    await expect(page).not.toHaveURL(/admin\/alerts$/);
  });
});
