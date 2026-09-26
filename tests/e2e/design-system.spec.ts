import { expect, test } from "@playwright/test";

test.describe("design system page fit", () => {
  test("public and staff pages stay within the viewport on desktop and mobile", async ({ page }) => {
    const paths = ["/", "/dashboard", "/verify/challenge-1"];

    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      const noHorizontalOverflow = await page.evaluate(() => {
        const bodyWidth = document.body.scrollWidth;
        const viewportWidth = window.innerWidth;
        return bodyWidth <= viewportWidth + 1;
      });
      expect(noHorizontalOverflow).toBeTruthy();
    }
  });

  test("narrow phone layouts remain usable without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const noHorizontalOverflow = await page.evaluate(() => {
      const bodyWidth = document.body.scrollWidth;
      const viewportWidth = window.innerWidth;
      return bodyWidth <= viewportWidth + 1;
    });
    expect(noHorizontalOverflow).toBeTruthy();
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: /log in/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /make every lesson feel connected/i })).toBeVisible();
  });
});
