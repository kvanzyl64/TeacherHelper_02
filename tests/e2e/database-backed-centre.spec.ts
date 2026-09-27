import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";

// Authenticated persistence coverage for User Story 4.
//
// A created centre/student must survive navigation and reload and must never be
// visible to a second centre. Authenticated centre E2E requires pre-minted managed
// OIDC id tokens for two seeded centres (an owner in centre A and any member of
// centre B) plus an isolated test database. Provide them via environment variables:
//   E2E_CENTRE_A_ID_TOKEN  - id token cookie value for an active owner in centre A
//   E2E_CENTRE_B_ID_TOKEN  - id token cookie value for an active member in centre B
// When they are absent the test is skipped rather than asserting fixture behaviour.

const centreAToken = process.env.E2E_CENTRE_A_ID_TOKEN;
const centreBToken = process.env.E2E_CENTRE_B_ID_TOKEN;
const hasCentreCredentials = Boolean(centreAToken && centreBToken);

async function signInAs(context: import("@playwright/test").BrowserContext, token: string, baseURL: string) {
  const url = new URL(baseURL);
  await context.clearCookies();
  await context.addCookies([
    {
      name: "teacher_helper_oidc_id_token",
      value: token,
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

test.describe("database-backed centre workflows", () => {
  test.skip(!hasCentreCredentials, "Set E2E_CENTRE_A_ID_TOKEN and E2E_CENTRE_B_ID_TOKEN to run authenticated centre persistence tests.");

  test("a created student persists across reload and stays invisible to another centre", async ({ page, context, baseURL }) => {
    const origin = baseURL ?? "http://localhost:3000";
    const reference = `E2E-${randomBytes(4).toString("hex").toUpperCase()}`;
    const name = `Synthetic Learner ${reference}`;

    await signInAs(context, centreAToken!, origin);

    await page.goto("/people/students/new");
    await page.getByLabel("Reference").fill(reference);
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Save student" }).click();

    // Fresh request after navigation: the record must be read back from PostgreSQL.
    await page.goto("/people/students");
    await expect(page.getByText(`${name} (${reference})`)).toBeVisible();

    // Reload proves the value is persisted, not held in memory.
    await page.reload();
    await expect(page.getByText(`${name} (${reference})`)).toBeVisible();

    // A second centre must not see the first centre's student.
    await signInAs(context, centreBToken!, origin);
    await page.goto("/people/students");
    await expect(page.getByText(reference)).toHaveCount(0);
  });
});
