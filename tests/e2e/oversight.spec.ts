import { expect, test } from "@playwright/test";

test("centre dashboard and operations pages render for an owner", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Centre dashboard" })).toBeVisible();

  await page.goto("/exports");
  await expect(page.getByRole("heading", { name: "Exports" })).toBeVisible();

  await page.goto("/operations/alerts");
  await expect(page.getByRole("heading", { name: "Operations alerts" })).toBeVisible();
});
