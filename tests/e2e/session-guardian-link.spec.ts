import { expect, test } from "@playwright/test";

test("guardian session link stays mobile-friendly and protected", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/verify/placeholder");
  await expect(page.getByRole("heading", { name: /verify your whatsapp number/i })).toBeVisible();
  await expect(page.locator("body")).toContainText("one-time");
});
