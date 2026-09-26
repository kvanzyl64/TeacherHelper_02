import type { Page } from "@playwright/test";

export const adminRoutes = {
  overview: "/admin",
  billing: "/admin/billing",
  alerts: "/admin/alerts",
} as const;

export async function expectAdminNavigation(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await page.getByRole("navigation", { name: "Platform administration navigation" }).waitFor();
}

export async function assertAdminViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("main").waitFor();
}
