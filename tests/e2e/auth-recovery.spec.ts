import { randomBytes, randomUUID } from "node:crypto";
import { Pool } from "pg";
import { expect, test } from "@playwright/test";
import { hashPassword } from "../../apps/web/lib/auth/platform-admin-credentials";

test.use({ trace: "off" });

const databaseUrl = process.env.TEST_DATABASE_URL;
const captureSecret = process.env.AUTH_TEST_RECOVERY_CAPTURE_SECRET;
const recoveryE2EEnabled = Boolean(databaseUrl && captureSecret && process.env.PGPASSWORD);

test.describe("password recovery", () => {
  test("captures a recovery link, changes the password once, and rejects the old password", async ({
    page,
    request,
  }) => {
    test.skip(
      !recoveryE2EEnabled,
      "TEST_DATABASE_URL, PGPASSWORD, and AUTH_TEST_RECOVERY_CAPTURE_SECRET are required.",
    );

    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const suffix = randomUUID();
    const email = `recovery-${suffix}@example.test`;
    const oldPassword = randomBytes(32).toString("base64url");
    const newPassword = randomBytes(32).toString("base64url");
    let centreId: string | undefined;
    let userId: string | undefined;

    try {
      const centre = await client.query<{ id: string }>(
        "INSERT INTO app.centres (name, status) VALUES ($1, 'active') RETURNING id",
        [`Recovery browser ${suffix}`],
      );
      centreId = centre.rows[0].id;
      const user = await client.query<{ id: string }>(
        "INSERT INTO app.users (email, display_name, authentication_status, password_hash) VALUES ($1, $2, 'active', $3) RETURNING id",
        [email, "Synthetic Recovery Browser User", await hashPassword(oldPassword)],
      );
      userId = user.rows[0].id;
      await client.query(
        "INSERT INTO app.centre_memberships (centre_id, user_id, role, status) VALUES ($1, $2, 'owner', 'active')",
        [centreId, userId],
      );

      await page.goto("/auth/login");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(oldPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/dashboard$/);

      await page.goto("/auth/recover");
      await page.getByLabel("Email").fill(email);
      await page.getByRole("button", { name: "Send recovery link" }).click();
      await expect(page.getByRole("status")).toContainText(
        "If an active account matches that email",
      );

      const captureResponse = await request.get(
        `/api/test/recovery-delivery?email=${encodeURIComponent(email)}`,
        { headers: { "x-recovery-test-secret": captureSecret! } },
      );
      expect(captureResponse.ok()).toBe(true);
      const delivery = (await captureResponse.json()) as { recoveryUrl: string };

      await page.goto(delivery.recoveryUrl);
      await page.getByRole("textbox", { name: "New password", exact: true }).fill(newPassword);
      await page
        .getByRole("textbox", { name: "Confirm new password", exact: true })
        .fill(newPassword);
      await page.getByRole("button", { name: "Update password" }).click();
      await expect(page).toHaveURL(/\/auth\/login\?recovered=1$/);
      await expect(page.getByRole("status")).toContainText("Your password has been updated");

      await page.goto(delivery.recoveryUrl);
      await expect(page.getByRole("heading", { name: "Link unavailable" })).toBeVisible();
      await expect(
        page.getByText(
          "This recovery link is invalid, expired, or already used. Request a new link to continue.",
          { exact: true },
        ),
      ).toBeVisible();

      await page.goto("/auth/login");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(oldPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText("Email or password is incorrect.", { exact: true })).toBeVisible();

      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(newPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
    } finally {
      if (userId) {
        await client.query("DELETE FROM app.centre_memberships WHERE user_id = $1", [userId]);
        await client.query("DELETE FROM app.users WHERE id = $1", [userId]);
      }
      if (centreId) await client.query("DELETE FROM app.centres WHERE id = $1", [centreId]);
      client.release();
      await pool.end();
    }
  });
});
