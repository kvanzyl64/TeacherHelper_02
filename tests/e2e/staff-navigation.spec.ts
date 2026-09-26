import { expect, test } from "@playwright/test";

test.describe("staff navigation", () => {
  test("centre pages expose headings and parent workspace context", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /centre dashboard/i })).toBeVisible();
    await expect(page.getByText("Centre workspace", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /back to dashboard/i })).toBeVisible();

    await page.goto("/people");
    await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Students" })).toHaveAttribute("href", "/people/students");
  });

  test("tutor pages expose assigned workflow without owner-only navigation", async ({ page }) => {
    await page.goto("/students");
    await expect(page.getByRole("heading", { name: "My students" })).toBeVisible();
    await expect(page.locator(".workspace-shell__scope")).toHaveText("Assigned centre");
    await expect(page.getByRole("link", { name: "Billing" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Exports" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Operations" })).toHaveCount(0);
  });
});