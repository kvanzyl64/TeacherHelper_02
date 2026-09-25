import { expect, test } from "@playwright/test";

test("owner onboarding screen is available", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(page.getByRole("heading", { name: "Centre onboarding" })).toBeVisible();
  await expect(page.getByLabel("Centre name")).toBeVisible();
});

test("invitation acceptance screen is available", async ({ page }) => {
  await page.goto("/auth/invite/demo-token");
  await expect(page.getByRole("heading", { name: "Accept invitation" })).toBeVisible();
});
