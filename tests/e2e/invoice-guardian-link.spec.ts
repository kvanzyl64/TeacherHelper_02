import { expect, test } from "@playwright/test";

test("guardian link denies an unresolvable token without leaking records", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/link/test-token");

  await expect(page.getByRole("heading", { name: "This link is unavailable" })).toBeVisible();
  await expect(page.getByText("This protected link is no longer available. Please ask the centre for a fresh update or try again later.")).toBeVisible();
  await expect(page.getByText("Maths progress update")).toHaveCount(0);
});
