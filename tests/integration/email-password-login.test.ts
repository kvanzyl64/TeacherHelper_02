import { randomBytes, randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { authenticateAccountByEmail } from "../../apps/web/lib/auth/account";
import { checkAuthenticationRateLimit } from "../../apps/web/lib/auth/rate-limit";
import { recordAuthenticationEvent } from "../../apps/web/lib/auth/security-events";
import { hashPassword } from "../../apps/web/lib/auth/platform-admin-credentials";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("email/password login", () => {
  it("authenticates active centre and platform accounts and hides all failed credential cases", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const suffix = randomUUID();
    const password = randomBytes(32).toString("base64url");
    const passwordHash = await hashPassword(password);
    const wrongPassword = randomBytes(32).toString("base64url");
    const centreEmail = `centre-${suffix}@example.test`;
    const platformEmail = `platform-${suffix}@example.test`;
    const suspendedEmail = `suspended-${suffix}@example.test`;
    const throttledEmail = `throttled-${suffix}@example.test`;
    try {
      await client.query("BEGIN");
      const centre = await client.query<{ id: string }>(
        "INSERT INTO app.centres (name, status) VALUES ($1, 'active') RETURNING id",
        [`Login integration ${suffix}`],
      );
      const user = await client.query<{ id: string }>(
        "INSERT INTO app.users (email, display_name, authentication_status, password_hash) VALUES ($1, $2, 'active', $3) RETURNING id",
        [centreEmail, "Synthetic Login User", passwordHash],
      );
      await client.query(
        "INSERT INTO app.centre_memberships (centre_id, user_id, role, status) VALUES ($1, $2, 'owner', 'active')",
        [centre.rows[0].id, user.rows[0].id],
      );
      const activeAdmin = await client.query<{ id: string }>(
        "INSERT INTO app.platform_admins (email, display_name, password_hash, role, status) VALUES ($1, $2, $3, 'platform_owner', 'active') RETURNING id",
        [platformEmail, "Synthetic Login Owner", passwordHash],
      );
      await client.query(
        "INSERT INTO app.platform_admins (email, display_name, password_hash, role, status) VALUES ($1, $2, $3, 'platform_owner', 'suspended')",
        [suspendedEmail, "Synthetic Suspended Owner", passwordHash],
      );

      await expect(
        authenticateAccountByEmail(client, centreEmail, password),
      ).resolves.toMatchObject({
        kind: "centre",
        id: user.rows[0].id,
      });
      await expect(
        authenticateAccountByEmail(client, platformEmail, password),
      ).resolves.toMatchObject({
        kind: "platform_admin",
        id: activeAdmin.rows[0].id,
      });
      await expect(
        authenticateAccountByEmail(client, centreEmail, wrongPassword),
      ).resolves.toBeNull();
      await expect(
        authenticateAccountByEmail(client, `unknown-${suffix}@example.test`, wrongPassword),
      ).resolves.toBeNull();
      await expect(
        authenticateAccountByEmail(client, suspendedEmail, password),
      ).resolves.toBeNull();
      await client.query("UPDATE app.users SET authentication_status = 'revoked' WHERE id = $1", [
        user.rows[0].id,
      ]);
      await expect(authenticateAccountByEmail(client, centreEmail, password)).resolves.toBeNull();

      for (let attempt = 0; attempt < 5; attempt += 1) {
        await recordAuthenticationEvent(client, {
          eventType: "sign_in_failure",
          outcome: "failure",
          email: throttledEmail,
        });
      }
      await expect(
        checkAuthenticationRateLimit(client, { email: throttledEmail, scope: "sign_in" }),
      ).resolves.toMatchObject({ allowed: false, remaining: 0 });
      await client.query("ROLLBACK");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  });
});
