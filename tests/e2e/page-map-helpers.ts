import { expect, type Page } from "@playwright/test";

export const desktopViewport = { width: 1280, height: 800 } as const;
export const mobileViewport = { width: 390, height: 844 } as const;

export async function useViewport(page: Page, viewport: typeof desktopViewport | typeof mobileViewport) {
  await page.setViewportSize(viewport);
}

export async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(() =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
  ).toBe(0);
}

export async function captureKeyboardFocus(page: Page) {
  await page.keyboard.press("Tab");
  return page.evaluate(() => {
    const element = document.activeElement;
    return {
      tagName: element?.tagName ?? null,
      accessibleName: element?.getAttribute("aria-label") ?? element?.textContent?.trim() ?? null,
    };
  });
}

export async function emulateReducedMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
}