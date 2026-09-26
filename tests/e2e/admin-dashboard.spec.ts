import { expect, test } from "@playwright/test";
import {
  adminRoutes,
  assertAdminViewport,
  expectAdminNavigation,
  hasAdminTestCredentials,
} from "./admin-helpers";

test.describe("platform admin dashboard", () => {
  test.skip(!hasAdminTestCredentials, "Platform admin E2E credentials are not configured.");

  test("shows portfolio health and safe navigation", async ({ page }) => {
    await expectAdminNavigation(page, adminRoutes.overview);
    await assertAdminViewport(page);

    await expect(page.getByRole("heading", { name: "Portfolio overview" })).toBeVisible();
    await expect(page.getByText("Active centres")).toBeVisible();
    await expect(page.getByText("Trial centres")).toBeVisible();
    await expect(page.getByText("Overdue centres")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open alerts" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Billing", exact: true })).toHaveAttribute(
      "href",
      "/admin/billing",
    );
    await expect(page.getByRole("link", { name: "Alerts", exact: true })).toHaveAttribute(
      "href",
      "/admin/alerts",
    );
    await expect(page.getByText(/student|learner|guardian|session/i)).toHaveCount(0);
  });
});
