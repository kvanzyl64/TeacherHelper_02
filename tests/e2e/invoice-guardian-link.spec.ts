import { expect, test } from "@playwright/test";

test("guardian invoice link renders a single-record, phone-friendly invoice page", async ({ page }) => {
  await page.goto("/link/test-token");

  await expect(page.getByRole("heading", { name: "Guardian update" })).toBeVisible();
  await expect(page.getByText("This protected link is limited to the approved session for your learner.")).toBeVisible();
  await expect(page.getByText("Maths progress update")).toBeVisible();
});
