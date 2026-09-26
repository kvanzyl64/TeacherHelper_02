import type { Page } from "@playwright/test";

export const adminRoutes = {
  overview: "/admin",
  billing: "/admin/billing",
  alerts: "/admin/alerts",
} as const;

export const hasAdminTestCredentials = Boolean(
  process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD,
);

export async function expectAdminNavigation(page: Page, route: string): Promise<void> {
  if (!hasAdminTestCredentials) {
    throw new Error(
      "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run platform admin browser tests.",
    );
  }
  await page.goto(route);
  if (page.url().includes("/auth/login")) {
    await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
  }
  await page.getByRole("navigation", { name: "Platform administration navigation" }).waitFor();
}

export async function assertAdminViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("main").waitFor();
}
