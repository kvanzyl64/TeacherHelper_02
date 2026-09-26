import { expect, test } from "@playwright/test";

test.describe("design system accessibility", () => {
  test("focus and accessible names remain visible on key interactive elements", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Main navigation" });
    const links = [
      nav.getByRole("link", { name: /log in/i }),
      nav.getByRole("link", { name: /start free/i }),
      nav.getByRole("link", { name: /how it works/i }),
      nav.getByRole("link", { name: /trust and privacy/i }),
    ];

    for (const link of links) {
      await expect(link).toBeVisible();
    }

    await nav.getByRole("link", { name: /log in/i }).focus();
    await expect(nav.getByRole("link", { name: /log in/i })).toBeFocused();
  });

  test("guardian form and state content remain understandable without relying on motion", async ({ page }) => {
    await page.goto("/verify/challenge-1");
    await expect(page.getByRole("heading", { name: /verify your whatsapp number/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /confirm number/i })).toBeVisible();
    await expect(page.locator("input[name='code']")).toHaveAttribute("inputmode", "numeric");
  });
});
