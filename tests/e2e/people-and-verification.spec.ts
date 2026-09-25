import { expect, test } from "@playwright/test";

test.describe("people and guardian verification", () => {
  test("administrator can reach people records", async ({ page }) => {
    await page.goto("/people");
    await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Add student" })).toBeVisible();
  });

  test("guardian verification is usable on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/verify/challenge-1");
    await expect(page.getByRole("heading", { name: "Verify your WhatsApp number" })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow-x", "visible");
  });
});