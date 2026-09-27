import { expect, test } from "@playwright/test";
import { assertAdminViewport, expectAdminNavigation, hasAdminTestCredentials } from "./admin-helpers";

test.describe("live platform portfolio", () => {
  test.skip(!hasAdminTestCredentials, "Platform admin E2E credentials are not configured.");

  test("renders database-backed portfolio states without protected records", async ({ page }) => {
    await expectAdminNavigation(page, "/admin");
    await assertAdminViewport(page);

    await expect(page.getByRole("heading", { name: /Portfolio overview|Portfolio unavailable/ })).toBeVisible();
    await expect(page.getByText("Active centres")).toHaveCount(1);
    await expect(page.getByText(/student|learner|guardian|session/i)).toHaveCount(0);
  });

  test("renders a safe centre detail or generic unavailable state", async ({ page }) => {
    await expectAdminNavigation(page, "/centres/00000000-0000-0000-0000-000000000000");
    await expect(page.getByRole("heading", { name: /Centre unavailable|requested resource is unavailable/i })).toBeVisible();
    await expect(page.getByText(/student|learner|guardian|session/i)).toHaveCount(0);
  });
});
