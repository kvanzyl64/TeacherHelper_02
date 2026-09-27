import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const recoveryE2EEnabled = Boolean(
  process.env.AUTH_TEST_RECOVERY_CAPTURE_SECRET &&
  process.env.TEST_DATABASE_URL &&
  process.env.PGPASSWORD,
);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  (recoveryE2EEnabled ? "http://localhost:3100" : "http://localhost:3000");
const port = new URL(baseURL).port || "3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: { baseURL, trace: "on-first-retry" },
  webServer: {
    command: `pnpm --filter @teacher-helper/web exec next dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI && !recoveryE2EEnabled,
    ...(recoveryE2EEnabled
      ? {
          env: {
            AUTH_TEST_RECOVERY_CAPTURE_SECRET: process.env.AUTH_TEST_RECOVERY_CAPTURE_SECRET!,
            DATABASE_URL: process.env.TEST_DATABASE_URL!,
            NEXT_PUBLIC_APP_URL: baseURL,
          },
        }
      : {}),
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
