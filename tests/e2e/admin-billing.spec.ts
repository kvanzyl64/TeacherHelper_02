import { expect, test } from "@playwright/test";
import { adminRoutes, assertAdminViewport, expectAdminNavigation } from "./admin-helpers";

test.describe("platform admin billing", () => {
  test("shows subscription health, overdue follow-up, and plan adoption", async ({ page }) => {
    await expectAdminNavigation(page, adminRoutes.billing);
    await assertAdminViewport(page);

    await expect(page.getByRole("heading", { name: "Billing overview" })).toBeVisible();
    await expect(page.getByText("Overdue centres")).toBeVisible();
    await expect(page.getByText("Failed payments")).toBeVisible();
    await expect(page.getByText("Plan adoption")).toBeVisible();
    await expect(page.getByRole("link", { name: /follow up/i }).first()).toBeVisible();
    await expect(page.getByText(/student|learner|guardian|session/i)).toHaveCount(0);
  });
});
